
-- Create a messages table to store messages for users
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  institute_id UUID REFERENCES institutes(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('trainer', 'institute_owner')),
  message_type TEXT NOT NULL CHECK (message_type IN ('appointment_refusal', 'inquiry_reply')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own messages
CREATE POLICY "Users can view their own messages" 
  ON public.messages 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows institute owners to INSERT messages to customers
CREATE POLICY "Institute owners can send messages to customers" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutes 
      WHERE institutes.id = messages.institute_id 
      AND institutes.owner_id = auth.uid()
    )
  );

-- Create policy that allows users to UPDATE their own messages (mark as read)
CREATE POLICY "Users can update their own messages" 
  ON public.messages 
  FOR UPDATE 
  USING (auth.uid() = user_id);
