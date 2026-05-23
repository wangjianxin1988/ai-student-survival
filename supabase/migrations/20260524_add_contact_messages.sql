-- Create contact_messages table for storing contact form submissions
-- Even if email sending fails, messages are persisted to database

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('feedback', 'bug', 'feature', 'other')),
  message TEXT NOT NULL,
  ip_address VARCHAR(45),
  captcha_verified BOOLEAN DEFAULT false,
  email_sent BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_type ON contact_messages(type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Admin users can read all contact messages
CREATE POLICY "Admins can read all contact messages"
ON contact_messages FOR SELECT
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Any visitor can submit a contact message (rate limited at API level)
CREATE POLICY "Anyone can insert contact messages"
ON contact_messages FOR INSERT
WITH CHECK (true);

-- Admin can update status
CREATE POLICY "Admins can update contact messages"
ON contact_messages FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Comment for table
COMMENT ON TABLE contact_messages IS 'Contact form submissions - stores messages even if email fails';
