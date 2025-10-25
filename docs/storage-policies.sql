-- ============================================
-- 存储桶 RLS 策略设置脚本
-- ============================================
-- 说明：此脚本需要在完成主迁移后单独执行
-- 如果遇到权限问题，请在 Supabase Dashboard 的
-- Storage -> Policies 中手动创建策略
-- ============================================

-- 清理旧策略
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public files are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 策略 1：允许已认证用户上传头像
CREATE POLICY "Users can upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- 策略 2：允许所有人查看公开文件
CREATE POLICY "Public files are viewable by everyone"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'user-uploads');

-- 策略 3：允许用户删除自己的文件
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- 验证策略
SELECT 
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%user%';
