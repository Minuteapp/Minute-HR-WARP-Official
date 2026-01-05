-- Kommentare zu Artikeln
CREATE TABLE IF NOT EXISTS knowledge_article_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES knowledge_article_comments(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoriten
CREATE TABLE IF NOT EXISTS knowledge_article_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Zuletzt angesehen Tracking
CREATE TABLE IF NOT EXISTS knowledge_article_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  view_count INT DEFAULT 1
);

-- Feedback (Hilfreich/Nicht hilfreich)
CREATE TABLE IF NOT EXISTS knowledge_article_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  is_helpful BOOLEAN NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, user_id)
);

-- Verwandte Artikel
CREATE TABLE IF NOT EXISTS knowledge_article_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  source_article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  related_article_id UUID NOT NULL REFERENCES knowledge_articles(id) ON DELETE CASCADE,
  relation_type VARCHAR(50) DEFAULT 'related',
  relevance_score INT DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE knowledge_article_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_article_relations ENABLE ROW LEVEL SECURITY;

-- RLS Policies für Comments (jeder kann lesen, nur eigene erstellen/bearbeiten)
CREATE POLICY "Users can view all comments" ON knowledge_article_comments FOR SELECT USING (true);
CREATE POLICY "Users can create their own comments" ON knowledge_article_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON knowledge_article_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON knowledge_article_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies für Favorites
CREATE POLICY "Users can view their own favorites" ON knowledge_article_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own favorites" ON knowledge_article_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favorites" ON knowledge_article_favorites FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies für Views
CREATE POLICY "Users can view their own views" ON knowledge_article_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own views" ON knowledge_article_views FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies für Feedback
CREATE POLICY "Users can view their own feedback" ON knowledge_article_feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own feedback" ON knowledge_article_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON knowledge_article_feedback FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies für Relations (alle können lesen)
CREATE POLICY "Users can view article relations" ON knowledge_article_relations FOR SELECT USING (true);

-- Indexes für Performance
CREATE INDEX idx_comments_article ON knowledge_article_comments(article_id);
CREATE INDEX idx_comments_user ON knowledge_article_comments(user_id);
CREATE INDEX idx_favorites_user ON knowledge_article_favorites(user_id);
CREATE INDEX idx_favorites_article ON knowledge_article_favorites(article_id);
CREATE INDEX idx_views_user_article ON knowledge_article_views(user_id, article_id);
CREATE INDEX idx_views_article ON knowledge_article_views(article_id);
CREATE INDEX idx_feedback_article ON knowledge_article_feedback(article_id);
CREATE INDEX idx_relations_source ON knowledge_article_relations(source_article_id);
CREATE INDEX idx_relations_related ON knowledge_article_relations(related_article_id);

-- Trigger für auto-increment view_count
CREATE OR REPLACE FUNCTION increment_article_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE knowledge_articles
  SET view_count = view_count + 1
  WHERE id = NEW.article_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_article_view
AFTER INSERT ON knowledge_article_views
FOR EACH ROW EXECUTE FUNCTION increment_article_views();

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON knowledge_article_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();