"use client";

import { useRef, useState } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/lib/supabase/client";

export function VoiceRecorderButton({
  conversationId,
  senderId,
  onSent,
}: {
  conversationId: string;
  senderId: string;
  onSent: () => void;
}) {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadAndSend(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      // Microphone permission denied or unavailable — fail silently,
      // the button simply stays in its idle state.
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const uploadAndSend = async (blob: Blob) => {
    setUploading(true);
    const path = `${senderId}/${crypto.randomUUID()}.webm`;

    const { error: uploadError } = await supabase.storage
      .from("chat-media")
      .upload(path, blob, { contentType: "audio/webm" });

    if (!uploadError) {
      const { data: publicUrlData } = supabase.storage.from("chat-media").getPublicUrl(path);

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: t("communication.voiceMessagePlaceholder"),
        media_url: publicUrlData.publicUrl,
        media_type: "audio",
      });

      onSent();
    }
    setUploading(false);
  };

  if (uploading) {
    return (
      <Button size="icon" variant="outline" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      size="icon"
      variant={recording ? "destructive" : "outline"}
      onClick={recording ? stopRecording : startRecording}
      aria-label={recording ? t("communication.recording") : "Record voice message"}
    >
      {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
