# Avatar Upload Setup

## Supabase Storage Configuration

To enable profile picture uploads, you need to create a storage bucket in your Supabase project:

### 1. Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create Bucket**
4. Name the bucket: `avatars`
5. Set it as **Public** (so profile pictures can be displayed)
6. Click **Create Bucket**

### 2. Set Bucket Policies

After creating the bucket, set up the following policies:

#### Allow authenticated users to upload their own avatars:
```sql
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Allow authenticated users to update their own avatars:
```sql
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Allow public access to view avatars:
```sql
CREATE POLICY "Public avatars are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');
```

### 3. Verify Setup

Once configured, users can:
- Upload profile pictures (max 5MB)
- Supported formats: JPG, PNG, GIF, WebP
- Images are stored at `{user_id}/avatar.{extension}`
- Public URLs are automatically generated

### Troubleshooting

If uploads fail:
1. Check that the `avatars` bucket exists and is public
2. Verify the storage policies are applied
3. Check browser console for specific error messages
4. Ensure user is authenticated before uploading 