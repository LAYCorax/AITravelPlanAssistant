-- 用户资料表创建脚本

-- 1. 创建 user_profiles 表（如果不存在）
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50),
  avatar_url TEXT,
  phone VARCHAR(20),
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 创建 user-uploads 存储桶（用于头像和其他用户上传文件）
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 3. 设置存储桶的RLS策略
-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 允许已认证用户上传文件
CREATE POLICY "Users can upload their own files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' AND 
  (storage.foldername(name))[1] = 'avatars'
);

-- 允许所有人查看公开文件
CREATE POLICY "Public files are viewable by everyone" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'user-uploads');

-- 允许用户删除自己的文件
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'user-uploads' AND 
  (storage.foldername(name))[1] = 'avatars'
);

-- 4. 设置 user_profiles 表的RLS策略
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的旧策略
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- 用户可以查看自己的资料
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT TO authenticated
USING (auth.uid() = public.user_profiles.user_id);

-- 用户可以插入自己的资料
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = public.user_profiles.user_id);

-- 用户可以更新自己的资料
CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE TO authenticated
USING (auth.uid() = public.user_profiles.user_id)
WITH CHECK (auth.uid() = public.user_profiles.user_id);

-- 5. 创建更新时间戳触发器
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- 6. 创建索引优化查询
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- 7. 验证表结构
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
