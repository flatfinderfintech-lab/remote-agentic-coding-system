/**
 * Database Operations
 *
 * Type-safe database operations for Idea Bucket
 */

import { prisma } from './prisma';
import { summarizeIdea, proposeConceptClusters, generateSpecKitDraft } from './aiIdeaBucket';

export type IdeaCard = {
  id: string;
  createdAt: Date;
  description: string;
  imageUrl: string | null;
  title: string | null;
  summary: string | null;
  tags: string | null;
  processed: boolean;
};

export type ConceptCluster = {
  id: string;
  createdAt: Date;
  name: string;
  summary: string;
  status: string;
};

export type SpecKitDraft = {
  id: string;
  createdAt: Date;
  problem: string;
  targetUser: string;
  solution: string;
  coreFeatures: string;
  differentiation: string;
  sourceIdeaIds: string;
};

/**
 * Create a new idea card (unprocessed)
 */
export async function createIdeaCard(
  description: string,
  imageUrl?: string
): Promise<IdeaCard> {
  return await prisma.ideaCard.create({
    data: {
      description,
      imageUrl: imageUrl || null,
      processed: false,
    },
  });
}

/**
 * Process an idea card with AI
 */
export async function processIdeaCard(ideaId: string): Promise<IdeaCard> {
  const idea = await prisma.ideaCard.findUnique({
    where: { id: ideaId },
  });

  if (!idea) {
    throw new Error('Idea not found');
  }

  if (idea.processed) {
    return idea;
  }

  // Call AI to generate title, summary, tags
  const aiSummary = await summarizeIdea(idea.description, idea.imageUrl || undefined);

  return await prisma.ideaCard.update({
    where: { id: ideaId },
    data: {
      title: aiSummary.title,
      summary: aiSummary.summary,
      tags: JSON.stringify(aiSummary.tags),
      processed: true,
    },
  });
}

/**
 * Get all idea cards, sorted by creation date (newest first)
 */
export async function getAllIdeaCards(): Promise<IdeaCard[]> {
  return await prisma.ideaCard.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single idea card by ID
 */
export async function getIdeaCard(id: string): Promise<IdeaCard | null> {
  return await prisma.ideaCard.findUnique({
    where: { id },
  });
}

/**
 * Generate concept clusters from all ideas
 */
export async function generateConceptClusters(): Promise<number> {
  const ideas = await prisma.ideaCard.findMany({
    where: { processed: true },
  });

  if (ideas.length < 2) {
    return 0;
  }

  const proposals = await proposeConceptClusters(
    ideas.map(idea => ({
      id: idea.id,
      description: idea.description,
      title: idea.title || undefined,
      tags: idea.tags ? JSON.parse(idea.tags) : [],
    }))
  );

  let created = 0;
  for (const proposal of proposals) {
    await prisma.conceptCluster.create({
      data: {
        name: proposal.name,
        summary: proposal.summary,
        status: 'pending',
        ideas: {
          connect: proposal.ideaIds.map(id => ({ id })),
        },
      },
    });
    created++;
  }

  return created;
}

/**
 * Get all concept clusters with their ideas
 */
export async function getAllConceptClusters() {
  return await prisma.conceptCluster.findMany({
    include: {
      ideas: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a single concept cluster by ID with ideas
 */
export async function getConceptCluster(id: string) {
  return await prisma.conceptCluster.findUnique({
    where: { id },
    include: {
      ideas: true,
      specKitDraft: true,
    },
  });
}

/**
 * Update cluster status (accept/reject)
 */
export async function updateClusterStatus(
  id: string,
  status: 'accepted' | 'rejected'
): Promise<void> {
  await prisma.conceptCluster.update({
    where: { id },
    data: { status },
  });
}

/**
 * Generate spec kit draft from a concept cluster
 */
export async function createSpecKitDraft(clusterId: string) {
  const cluster = await prisma.conceptCluster.findUnique({
    where: { id: clusterId },
    include: { ideas: true },
  });

  if (!cluster) {
    throw new Error('Cluster not found');
  }

  if (cluster.status !== 'accepted') {
    throw new Error('Cluster must be accepted before generating spec kit');
  }

  // Check if spec kit already exists
  const existing = await prisma.specKitDraft.findUnique({
    where: { clusterId },
  });

  if (existing) {
    return existing;
  }

  // Call AI to generate spec kit
  const specKit = await generateSpecKitDraft(
    cluster.name,
    cluster.summary,
    cluster.ideas.map(idea => ({
      id: idea.id,
      description: idea.description,
      title: idea.title || undefined,
      summary: idea.summary || undefined,
    }))
  );

  return await prisma.specKitDraft.create({
    data: {
      clusterId,
      problem: specKit.problem,
      targetUser: specKit.targetUser,
      solution: specKit.solution,
      coreFeatures: JSON.stringify(specKit.coreFeatures),
      differentiation: specKit.differentiation,
      sourceIdeaIds: JSON.stringify(specKit.sourceIdeaIds),
    },
  });
}
