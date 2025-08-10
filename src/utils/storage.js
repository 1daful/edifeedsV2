import { supabase } from "../lib/supabase";
export async function addFiles(files) {
    const file = files[0];
    if (!file)
        return;
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
    });
    if (error) {
        console.error('Upload error:', error.message);
        return;
    }
    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
    return publicUrlData?.publicUrl || '';
}
