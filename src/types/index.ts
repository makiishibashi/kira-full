export type User = {
  id: string;
  email: string;
  name: string;
  partnerId?: string;
  partnerName?: string;
  partnerEmail?: string;
  inviteCode?: string;
};

export type Sparkle = {
  id: string;
  userId: string;
  userName: string;
  createdAt: number;
  text: string;
  imageUrl?: string;
  category: SparkleCategory;
  appreciation?: string;
  gratitude?: string;
  reactions: Reaction[];
};

export type SparkleCategory = 'partner' | 'self' | 'daily';

export type Reaction = {
  id: string;
  userId: string;
  emoji: string;
};

export type AIMessage = {
  id: string;
  text: string;
};

export type SparkleFormData = {
  text: string;
  imageUrl?: string;
  category: SparkleCategory;
  appreciation?: string;
  gratitude?: string;
};