import { supabase } from "../lib/supabase";

export default function UploadProof({ winningId }) {
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // 🔥 sanitize filename (VERY IMPORTANT)
      const cleanName = file.name.replace(/\s+/g, "-");

      const filePath = `${Date.now()}-${cleanName}`;

      // 🔥 upload file (with options)
      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError.message);
        alert(uploadError.message);
        return;
      }

      // 🔥 get public URL
      const { data } = supabase.storage
        .from("proofs")
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // 🔥 update DB
      const { error: updateError } = await supabase
        .from("winnings")
        .update({ proof_url: publicUrl })
        .eq("id", winningId);

      if (updateError) {
        console.error("DB update error:", updateError.message);
        alert(updateError.message);
        return;
      }

      alert("Proof uploaded successfully!");

      // ❌ REMOVE reload → better to refresh state from parent
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  return (
    <input
      type="file"
      onChange={handleUpload}
      className="mt-2 text-sm"
    />
  );
}