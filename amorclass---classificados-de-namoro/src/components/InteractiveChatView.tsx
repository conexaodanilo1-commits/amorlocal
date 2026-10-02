import React, { useState, useEffect, useRef } from 'react';
import {
  MessageItem,
  UserSession,
  PageView,
  DatingListing
} from '../types/classifieds';
import {
  subscribeToAllUserMessages,
  sendChatMessage,
  markMessagesAsRead
} from '../services/firebaseService';
import { getProfileAvatar } from '../data/profileImages';
import {
  Send,
  Mic,
  Square,
  Image,
  Video,
  Smile,
  Check,
  CheckCheck,
  Play,
  Pause,
  ArrowLeft,
  Search,
  MessageSquare,
  ExternalLink,
  X,
  User,
  Paperclip,
  Trash2
} from 'lucide-react';

interface InteractiveChatViewProps {
  user: UserSession;
  listings: DatingListing[];
  onNavigate: (view: PageView) => void;
  initialConversationContact?: string;
  initialListingId?: string;
}

interface ConversationGroup {
  contactKey: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  contactPhoto?: string;
  recipientListingId?: string;
  recipientListingTitle?: string;
  recipientListingPhoto?: string;
  lastMessage: MessageItem;
  unreadCount: number;
  messages: MessageItem[];
}

export const InteractiveChatView: React.FC<InteractiveChatViewProps> = ({
  user,
  listings,
  onNavigate,
  initialConversationContact,
  initialListingId
}) => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContactKey, setActiveContactKey] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Message input state
  const [textInput, setTextInput] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Media recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // File attachments state
  const [pendingMedia, setPendingMedia] = useState<{
    type: 'image' | 'video' | 'audio';
    url: string;
    file?: File;
    name?: string;
  } | null>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);

  // Image lightbox preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // User's own listings IDs
  const myListingIds = listings
    .filter(
      (l) =>
        user.myListingIds?.includes(l.id) ||
        (user.email &&
          l.contact.email &&
          l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    )
    .map((l) => l.id);

  // Real-time listener for all user messages
  useEffect(() => {
    if (!user.email && myListingIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAllUserMessages(
      user.email || '',
      myListingIds,
      (allMsgs) => {
        setMessages(allMsgs);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user.email, myListingIds.join(',')]);

  // Group messages into distinct conversations
  const conversations: ConversationGroup[] = React.useMemo(() => {
    const groups: { [key: string]: ConversationGroup } = {};
    const normMyEmail = (user.email || '').toLowerCase().trim();

    messages.forEach((msg) => {
      const sEmail = (msg.senderEmail || '').toLowerCase().trim();
      const rEmail = (msg.recipientEmail || '').toLowerCase().trim();

      const isMeSender = normMyEmail && sEmail === normMyEmail;
      const otherEmail = isMeSender ? rEmail : sEmail;
      const otherName = isMeSender ? (rEmail ? rEmail.split('@')[0] : 'Interessado') : msg.senderName;
      const contactKey = otherEmail || msg.recipientListingId || msg.senderName || 'conversacao';

      // Resolve authentic photo for the contact or announcement
      let photo = (!isMeSender ? msg.senderPhoto : msg.recipientListingPhoto) || undefined;
      if (!photo && msg.recipientListingId) {
        const ad = listings.find((l) => l.id === msg.recipientListingId);
        if (ad?.images?.[0]) photo = ad.images[0];
      }
      if (!photo && otherEmail) {
        const adByEmail = listings.find(
          (l) => l.contact?.email && l.contact.email.toLowerCase().trim() === otherEmail
        );
        if (adByEmail?.images?.[0]) photo = adByEmail.images[0];
      }
      if (!photo) {
        photo = getProfileAvatar(contactKey, 'Feminino', 25, otherName || 'Contato');
      }

      let resolvedContactEmail = otherEmail || '';
      if (!resolvedContactEmail.includes('@') && msg.recipientListingId) {
        const ad = listings.find((l) => l.id === msg.recipientListingId);
        if (ad?.contact?.email) {
          resolvedContactEmail = ad.contact.email.toLowerCase().trim();
        }
      }

      if (!groups[contactKey]) {
        groups[contactKey] = {
          contactKey,
          contactEmail: resolvedContactEmail,
          contactName: otherName || 'Contato',
          contactPhone: isMeSender ? '' : msg.senderPhone,
          contactPhoto: photo,
          recipientListingId: msg.recipientListingId,
          recipientListingTitle: msg.recipientListingTitle,
          recipientListingPhoto: msg.recipientListingPhoto || photo,
          lastMessage: msg,
          unreadCount: 0,
          messages: []
        };
      } else {
        if (photo && !groups[contactKey].contactPhoto) {
          groups[contactKey].contactPhoto = photo;
        }
        if (!groups[contactKey].contactEmail.includes('@') && resolvedContactEmail.includes('@')) {
          groups[contactKey].contactEmail = resolvedContactEmail;
        }
      }

      groups[contactKey].messages.push(msg);
      groups[contactKey].lastMessage = msg;

      // Count unread if I am the recipient
      if (!isMeSender && msg.isRead === false) {
        groups[contactKey].unreadCount += 1;
      }
    });

    // If initial conversation contact was requested and has no messages yet
    if (initialConversationContact && !groups[initialConversationContact]) {
      const initAd = initialListingId ? listings.find((l) => l.id === initialListingId) : undefined;
      const initPhoto = initAd?.images?.[0] || getProfileAvatar(initialConversationContact, 'Feminino', 25, initialConversationContact.split('@')[0]);
      let initialEmail = initialConversationContact;
      if (!initialEmail.includes('@') && initAd?.contact?.email) {
        initialEmail = initAd.contact.email.toLowerCase().trim();
      }

      groups[initialConversationContact] = {
        contactKey: initialConversationContact,
        contactEmail: initialEmail,
        contactName: initAd?.contact?.name || initialConversationContact.split('@')[0],
        contactPhoto: initPhoto,
        recipientListingId: initialListingId,
        recipientListingTitle: initAd?.title,
        recipientListingPhoto: initPhoto,
        lastMessage: {
          id: 'placeholder',
          senderName: initAd?.contact?.name || initialConversationContact.split('@')[0],
          senderEmail: initialEmail,
          recipientListingId: initialListingId || '',
          message: 'Inicie uma conversa...',
          sentAtDate: 'Hoje'
        },
        unreadCount: 0,
        messages: []
      };
    }

    // Sort conversations: latest active message first ("sempre a mensagem vigente e recebida")
    return Object.values(groups).sort((a, b) => {
      const timeA = a.lastMessage.createdAt?.toMillis
        ? a.lastMessage.createdAt.toMillis()
        : a.lastMessage.sentAtDate
        ? new Date(a.lastMessage.sentAtDate).getTime()
        : 0;
      const timeB = b.lastMessage.createdAt?.toMillis
        ? b.lastMessage.createdAt.toMillis()
        : b.lastMessage.sentAtDate
        ? new Date(b.lastMessage.sentAtDate).getTime()
        : 0;
      return timeB - timeA;
    });
  }, [messages, user.email, initialConversationContact, initialListingId, listings]);

  // Set default active conversation (always latest active message or initial)
  useEffect(() => {
    if (!activeContactKey && conversations.length > 0) {
      if (initialConversationContact) {
        const found = conversations.find(
          (c) =>
            c.contactKey === initialConversationContact ||
            c.contactEmail === initialConversationContact
        );
        if (found) {
          setActiveContactKey(found.contactKey);
          setMobileShowChat(true);
          return;
        }
      }
      setActiveContactKey(conversations[0].contactKey);
    }
  }, [conversations, activeContactKey, initialConversationContact]);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.contactKey === activeContactKey) || conversations[0];
  const markedReadIdsRef = useRef<Set<string>>(new Set());

  // Automatically mark unread messages as read when active conversation is viewed (ref-guarded for performance)
  useEffect(() => {
    if (!activeConversation) return;
    const normMyEmail = (user.email || '').toLowerCase().trim();
    const unreadFromOther = activeConversation.messages.filter((m) => {
      const sEmail = (m.senderEmail || '').toLowerCase().trim();
      return (
        m.isRead === false &&
        sEmail !== normMyEmail &&
        !markedReadIdsRef.current.has(m.id)
      );
    });

    if (unreadFromOther.length > 0) {
      unreadFromOther.forEach((m) => markedReadIdsRef.current.add(m.id));
      const unreadIds = unreadFromOther.map((m) => m.id);
      markMessagesAsRead(unreadIds);
    }
  }, [activeConversation?.contactKey, activeConversation?.messages.length, user.email]);

  // Auto-scroll to bottom of chat on new message or conversation switch
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConversation?.messages.length, activeContactKey]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      c.contactName.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q) ||
      (c.lastMessage.message || '').toLowerCase().includes(q) ||
      (c.recipientListingTitle || '').toLowerCase().includes(q)
    );
  });

  // Handle Image compression and attachment
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setPendingMedia({
          type: 'image',
          url: compressedDataUrl,
          file,
          name: file.name
        });
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Compress Video to safely fit within Firestore 1MB document limit (<650KB)
  const compressVideoForChat = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      // If already under 650KB, read directly as data URL
      if (file.size <= 650 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // For larger videos, compress via HTML5 canvas downscaled to 420p & MediaRecorder
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const fallbackTimer = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file.slice(0, 650 * 1024));
      }, 7000);

      video.onloadeddata = () => {
        const maxDim = 420;
        let width = video.videoWidth || 420;
        let height = video.videoHeight || 320;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (typeof canvas.captureStream === 'function' && typeof MediaRecorder !== 'undefined') {
          const stream = canvas.captureStream(12);
          let mimeType = 'video/webm';
          if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
            mimeType = 'video/webm;codecs=vp8';
          } else if (MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/mp4';
          }

          let recorder: MediaRecorder;
          try {
            recorder = new MediaRecorder(stream, {
              mimeType,
              videoBitsPerSecond: 280000 // 280 kbps
            });
          } catch {
            recorder = new MediaRecorder(stream);
          }

          const chunks: Blob[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunks.push(e.data);
          };

          recorder.onstop = () => {
            clearTimeout(fallbackTimer);
            URL.revokeObjectURL(objectUrl);
            const compressedBlob = new Blob(chunks, { type: mimeType });
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(compressedBlob);
          };

          recorder.start();
          video.currentTime = 0;
          video.play().catch(() => {});

          const maxDurationSec = Math.min(video.duration || 8, 8);
          const startTime = Date.now();
          let animId: number;

          const renderLoop = () => {
            if (video.paused || video.ended || (Date.now() - startTime) >= maxDurationSec * 1000) {
              cancelAnimationFrame(animId);
              if (recorder.state === 'recording') {
                recorder.stop();
              }
              return;
            }
            ctx?.drawImage(video, 0, 0, width, height);
            animId = requestAnimationFrame(renderLoop);
          };
          renderLoop();
        } else {
          clearTimeout(fallbackTimer);
          URL.revokeObjectURL(objectUrl);
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file.slice(0, 650 * 1024));
        }
      };

      video.onerror = () => {
        clearTimeout(fallbackTimer);
        URL.revokeObjectURL(objectUrl);
        // Fallback on error
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file.slice(0, 650 * 1024));
      };
    });
  };

  // Handle Video attachment with auto-compression and safe sizing
  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.size > 25 * 1024 * 1024) {
      alert('O vídeo selecionado excede 25MB. Escolha um clipe menor para envio.');
      return;
    }

    setIsProcessingVideo(true);
    try {
      const compressedUrl = await compressVideoForChat(file);
      setPendingMedia({
        type: 'video',
        url: compressedUrl,
        file,
        name: file.name
      });
    } catch (err) {
      console.warn('Video compression error:', err);
      alert('Não foi possível processar este vídeo. Tente outro formato ou vídeo mais curto.');
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Handle Audio File fallback
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setPendingMedia({
        type: 'audio',
        url: event.target?.result as string,
        file,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Audio Recording (Microphone)
  const startRecordingAudio = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        audioInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm'
        });
        stream.getTracks().forEach((track) => track.stop());

        const reader = new FileReader();
        reader.onloadend = () => {
          setPendingMedia({
            type: 'audio',
            url: reader.result as string,
            name: `Áudio_${new Date().toLocaleTimeString('pt-BR')}`
          });
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('[Chat] Microphone access not permitted or unavailable:', err);
      // Fallback to audio file selector
      audioInputRef.current?.click();
    }
  };

  const stopRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const cancelRecordingAudio = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
      setIsRecordingAudio(false);
      clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
  };

  // Send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!textInput.trim() && !pendingMedia) return;
    if (!activeConversation) return;

    const messageText = textInput.trim();
    const mediaToSend = pendingMedia;

    setTextInput('');
    setPendingMedia(null);
    setShowEmojiPicker(false);

    // User's own photo
    const myAd = listings.find(
      (l) =>
        (user.myListingIds && user.myListingIds.includes(l.id)) ||
        (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );
    const myPhoto = user.avatarPhoto || myAd?.images?.[0];

    // Ensure target recipient email is never empty
    let targetRecipientEmail = (activeConversation.contactEmail || '').toLowerCase().trim();
    if (!targetRecipientEmail.includes('@') && activeConversation.recipientListingId) {
      const ad = listings.find((l) => l.id === activeConversation.recipientListingId);
      if (ad?.contact?.email) {
        targetRecipientEmail = ad.contact.email.toLowerCase().trim();
      }
    }

    // Optimistic UI update: message appears instantly (0ms)
    const tempId = 'temp-' + Date.now();
    const optimisticMessage: MessageItem = {
      id: tempId,
      senderEmail: user.email || 'anonimo@amorclass.com',
      senderName: user.name || user.email?.split('@')[0] || 'Você',
      senderPhone: user.phone || '',
      senderPhoto: myPhoto,
      recipientEmail: targetRecipientEmail,
      recipientListingId: activeConversation.recipientListingId || '',
      recipientListingTitle: activeConversation.recipientListingTitle,
      recipientListingPhoto: activeConversation.contactPhoto,
      conversationId: activeConversation.contactKey,
      message: messageText,
      mediaType: mediaToSend ? mediaToSend.type : 'text',
      mediaUrl: mediaToSend ? mediaToSend.url : undefined,
      fileName: mediaToSend?.name,
      sentAtDate: new Date().toISOString(),
      isRead: false
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send in background without blocking UI
    sendChatMessage({
      senderEmail: user.email || 'anonimo@amorclass.com',
      senderName: user.name || user.email?.split('@')[0] || 'Você',
      senderPhone: user.phone || '',
      senderPhoto: myPhoto,
      recipientEmail: targetRecipientEmail,
      recipientListingId: activeConversation.recipientListingId,
      recipientListingTitle: activeConversation.recipientListingTitle,
      recipientListingPhoto: activeConversation.contactPhoto,
      conversationId: activeConversation.contactKey,
      message: messageText,
      mediaType: mediaToSend ? mediaToSend.type : 'text',
      mediaUrl: mediaToSend ? mediaToSend.url : undefined,
      fileName: mediaToSend?.name
    }).catch((err) => {
      console.warn('[Chat] Background message sending error:', err);
    });
  };

  // Instant 1-click emoji sending
  const handleSendDirectEmoji = async (emoji: string) => {
    if (!activeConversation) return;

    const myAd = listings.find(
      (l) =>
        (user.myListingIds && user.myListingIds.includes(l.id)) ||
        (user.email && l.contact.email && l.contact.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );
    const myPhoto = user.avatarPhoto || myAd?.images?.[0];

    let targetRecipientEmail = (activeConversation.contactEmail || '').toLowerCase().trim();
    if (!targetRecipientEmail.includes('@') && activeConversation.recipientListingId) {
      const ad = listings.find((l) => l.id === activeConversation.recipientListingId);
      if (ad?.contact?.email) {
        targetRecipientEmail = ad.contact.email.toLowerCase().trim();
      }
    }

    const tempId = 'temp-' + Date.now();
    const optimisticMessage: MessageItem = {
      id: tempId,
      senderEmail: user.email || 'anonimo@amorclass.com',
      senderName: user.name || user.email?.split('@')[0] || 'Você',
      senderPhone: user.phone || '',
      senderPhoto: myPhoto,
      recipientEmail: targetRecipientEmail,
      recipientListingId: activeConversation.recipientListingId || '',
      recipientListingTitle: activeConversation.recipientListingTitle,
      recipientListingPhoto: activeConversation.contactPhoto,
      conversationId: activeConversation.contactKey,
      message: emoji,
      mediaType: 'text',
      sentAtDate: new Date().toISOString(),
      isRead: false
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setShowEmojiPicker(false);

    sendChatMessage({
      senderEmail: user.email || 'anonimo@amorclass.com',
      senderName: user.name || user.email?.split('@')[0] || 'Você',
      senderPhone: user.phone || '',
      senderPhoto: myPhoto,
      recipientEmail: targetRecipientEmail,
      recipientListingId: activeConversation.recipientListingId,
      recipientListingTitle: activeConversation.recipientListingTitle,
      recipientListingPhoto: activeConversation.contactPhoto,
      conversationId: activeConversation.contactKey,
      message: emoji,
      mediaType: 'text'
    }).catch((err) => {
      console.warn('[Chat] Background emoji sending error:', err);
    });
  };

  const commonEmojis = ['❤️', '😍', '😘', '🔥', '🌹', '💋', '🥰', '😉', '💖', '💐', '🥂', '✨', '👋', '😊', '💬', '👍'];

  return (
    <div className="w-full bg-[#f8fafc] min-h-[calc(100vh-140px)] flex flex-col">
      {/* Lightbox Modal for Full Image View */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <button
            type="button"
            onClick={() => setLightboxImageUrl(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 rounded-full bg-black/40"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxImageUrl}
            alt="Foto ampliada"
            className="max-h-[90vh] max-w-[95vw] object-contain rounded-md shadow-2xl"
          />
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={videoInputRef}
        onChange={handleVideoFileChange}
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
      />
      <input
        type="file"
        ref={audioInputRef}
        onChange={handleAudioFileChange}
        accept="audio/*"
        className="hidden"
      />

      <div className="max-w-6xl w-full mx-auto px-2 sm:px-4 py-3 flex-1 flex flex-col">
        {/* Top Header Breadcrumb / Isolated Message Bar */}
        <div className="bg-white border border-gray-200 rounded-sm p-3 mb-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate({ type: 'my-account' })}
              className="text-xs font-semibold text-gray-600 hover:text-[#0098d9] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Minha Conta</span>
            </button>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Chat & Mensagens Interativas
              </h1>
            </div>
          </div>

          <div className="text-xs text-gray-500 hidden sm:flex items-center gap-2">
            <span>Conversas Ativas:</span>
            <span className="font-bold text-[#0098d9] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
              {conversations.length}
            </span>
          </div>
        </div>

        {/* Main 2-Column Chat Layout */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex-1 flex overflow-hidden min-h-[560px] h-[calc(100vh-210px)] relative">
          {/* Column 1: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col bg-white shrink-0 ${
              mobileShowChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-gray-100 bg-gray-50/70">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar mensagens e contatos..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-[#0098d9] text-gray-800"
                />
              </div>
            </div>

            {/* Conversations Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {loading ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  Carregando conversas em tempo real...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-2">
                    <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Nenhuma conversa encontrada</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Quando outros usuários enviarem mensagens pelo anúncio, elas aparecerão aqui em tempo real.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isActive = conv.contactKey === activeContactKey;
                  const isAudio = conv.lastMessage.mediaType === 'audio';
                  const isImage = conv.lastMessage.mediaType === 'image';
                  const isVideo = conv.lastMessage.mediaType === 'video';

                  return (
                    <div
                      key={conv.contactKey}
                      onClick={() => {
                        setActiveContactKey(conv.contactKey);
                        setMobileShowChat(true);
                      }}
                      className={`p-3 cursor-pointer transition-colors flex items-start gap-3 relative ${
                        isActive
                          ? 'bg-sky-50/80 border-l-4 border-l-[#0098d9]'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {conv.contactPhoto ? (
                          <img
                            src={conv.contactPhoto}
                            alt={conv.contactName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0098d9] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow-xs uppercase">
                            {conv.contactName.charAt(0) || 'U'}
                          </div>
                        )}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h4 className="text-xs font-bold text-gray-900 truncate">
                            {conv.contactName}
                          </h4>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
                            {conv.lastMessage.sentAtDate
                              ? conv.lastMessage.sentAtDate.includes('T')
                                ? new Date(conv.lastMessage.sentAtDate).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : conv.lastMessage.sentAtDate
                              : 'Hoje'}
                          </span>
                        </div>

                        {/* Ad context */}
                        {conv.recipientListingTitle && (
                          <p className="text-[10px] text-[#0098d9] font-medium truncate mb-1">
                            {conv.recipientListingTitle}
                          </p>
                        )}

                        {/* Last message preview */}
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[11px] text-gray-600 truncate flex items-center gap-1">
                            {isAudio && (
                              <span className="text-[#0098d9] font-semibold flex items-center gap-0.5">
                                <Mic className="w-3 h-3" /> Mensagem de Áudio
                              </span>
                            )}
                            {isImage && (
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <Image className="w-3 h-3" /> Foto anexada
                              </span>
                            )}
                            {isVideo && (
                              <span className="text-purple-600 font-semibold flex items-center gap-0.5">
                                <Video className="w-3 h-3" /> Vídeo anexado
                              </span>
                            )}
                            {!isAudio && !isImage && !isVideo && (
                              <span>{conv.lastMessage.message || 'Conversa iniciada'}</span>
                            )}
                          </p>

                          {conv.unreadCount > 0 && (
                            <span className="bg-[#0098d9] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Column 2: Active Chat Area */}
          <div
            className={`w-full flex-1 flex flex-col bg-[#fdfdfd] ${
              !mobileShowChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {activeConversation ? (
              <>
                {/* Chat Top Header */}
                <div className="p-3 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-xs z-10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setMobileShowChat(false)}
                      className="md:hidden p-1.5 -ml-1 text-gray-600 hover:text-gray-900 rounded-sm hover:bg-gray-100"
                      title="Voltar para conversas"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="relative shrink-0">
                      {activeConversation.contactPhoto ? (
                        <img
                          src={activeConversation.contactPhoto}
                          alt={activeConversation.contactName}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#0098d9] shadow-xs"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#0098d9] text-white flex items-center justify-center font-bold text-xs uppercase">
                          {activeConversation.contactName.charAt(0) || 'U'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white"></span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {activeConversation.contactName}
                        </h3>
                        <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate">
                        {activeConversation.contactEmail}
                      </p>
                    </div>
                  </div>

                  {/* Related Ad Link */}
                  {activeConversation.recipientListingId && (
                    <button
                      type="button"
                      onClick={() =>
                        onNavigate({
                          type: 'detail',
                          listingId: activeConversation.recipientListingId!
                        })
                      }
                      className="text-xs text-[#0098d9] hover:underline flex items-center gap-1.5 shrink-0 bg-sky-50 hover:bg-sky-100/70 px-2.5 py-1 rounded-sm border border-sky-200 transition-colors"
                      title="Ver anúncio relacionado"
                    >
                      {activeConversation.recipientListingPhoto && (
                        <img
                          src={activeConversation.recipientListingPhoto}
                          alt=""
                          className="w-5 h-5 rounded-xs object-cover"
                        />
                      )}
                      <span className="hidden sm:inline font-semibold">Anúncio:</span>
                      <span className="truncate max-w-[100px] sm:max-w-[150px]">
                        {activeConversation.recipientListingTitle || 'Ver Anúncio'}
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Chat Stream (Messages) */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                  {activeConversation.messages.map((msg, index) => {
                    const normMyEmail = (user.email || '').toLowerCase().trim();
                    const isMe = Boolean(
                      normMyEmail &&
                        (msg.senderEmail || '').toLowerCase().trim() === normMyEmail
                    );

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        {!isMe && (
                          <img
                            src={msg.senderPhoto || activeConversation.contactPhoto}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-200 shadow-xs mb-1"
                          />
                        )}
                        <div
                          className={`max-w-[85%] sm:max-w-md rounded-lg p-3 shadow-xs relative ${
                            isMe
                              ? 'bg-[#0098d9] text-white rounded-br-none'
                              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                          }`}
                        >
                          {/* Sender name for received group messages */}
                          {!isMe && (
                            <p className="text-[10px] font-bold text-[#0098d9] mb-1">
                              {msg.senderName}
                            </p>
                          )}

                          {/* 1. Text Message */}
                          {msg.message && (
                            <p
                              className={`leading-relaxed break-words whitespace-pre-wrap ${
                                commonEmojis.includes(msg.message.trim())
                                  ? 'text-3xl sm:text-4xl py-1'
                                  : 'text-xs sm:text-[13px]'
                              }`}
                            >
                              {msg.message}
                            </p>
                          )}

                          {/* 2. Audio Message Player */}
                          {msg.mediaType === 'audio' && msg.mediaUrl && (
                            <ChatAudioPlayer audioUrl={msg.mediaUrl} isMe={isMe} />
                          )}

                          {/* 3. Image Attachment */}
                          {msg.mediaType === 'image' && msg.mediaUrl && (
                            <div className="mt-1.5 cursor-pointer">
                              <img
                                src={msg.mediaUrl}
                                alt="Foto compartilhada"
                                onClick={() => setLightboxImageUrl(msg.mediaUrl!)}
                                className="max-h-60 rounded-md object-cover border border-white/20 hover:opacity-95 transition-opacity"
                              />
                            </div>
                          )}

                          {/* 4. Video Attachment */}
                          {msg.mediaType === 'video' && msg.mediaUrl && (
                            <div className="mt-1.5">
                              <video
                                src={msg.mediaUrl}
                                controls
                                playsInline
                                className="max-h-60 w-full rounded-md bg-black"
                              />
                            </div>
                          )}

                          {/* Meta: Time and Checkmark */}
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                              isMe ? 'text-sky-100' : 'text-gray-400'
                            }`}
                          >
                            <span>
                              {msg.sentAtDate && msg.sentAtDate.includes('T')
                                ? new Date(msg.sentAtDate).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : msg.sentAtDate || 'Hoje'}
                            </span>
                            {isMe && <CheckCheck className="w-3 h-3 text-sky-200" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Video Processing Indicator */}
                {isProcessingVideo && (
                  <div className="bg-purple-50 border-t border-purple-200 p-2.5 px-4 flex items-center gap-2.5 text-purple-900 text-xs font-semibold animate-pulse">
                    <span className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                    <span>Otimizando vídeo para entrega instantânea no chat...</span>
                  </div>
                )}

                {/* Pending Media Preview Banner */}
                {pendingMedia && (
                  <div className="bg-sky-50 border-t border-sky-200 p-2.5 px-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {pendingMedia.type === 'image' && (
                        <img
                          src={pendingMedia.url}
                          alt="Prévia"
                          className="w-10 h-10 object-cover rounded-sm border border-sky-300"
                        />
                      )}
                      {pendingMedia.type === 'video' && (
                        <video
                          src={pendingMedia.url}
                          className="w-12 h-10 object-cover rounded-sm border border-purple-300 bg-black"
                        />
                      )}
                      {pendingMedia.type === 'audio' && (
                        <div className="w-10 h-10 bg-[#0098d9] text-white rounded-sm flex items-center justify-center">
                          <Mic className="w-5 h-5" />
                        </div>
                      )}
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">
                          {pendingMedia.type === 'image' && 'Foto pronta para envio'}
                          {pendingMedia.type === 'video' && 'Vídeo pronto e otimizado'}
                          {pendingMedia.type === 'audio' && 'Áudio gravado pronto para envio'}
                        </p>
                        <p className="text-[10px] text-gray-500">{pendingMedia.name || 'Anexo'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        className="px-3 py-1.5 bg-[#0098d9] hover:bg-[#0077aa] text-white text-xs font-bold rounded-sm shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                        title="Enviar agora"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar {pendingMedia.type === 'video' ? 'Vídeo' : 'Anexo'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingMedia(null)}
                        className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                        title="Remover anexo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Emoji Quick Bar with Instant 1-Click Delivery */}
                {showEmojiPicker && (
                  <div className="bg-white border-t border-gray-200 p-2.5 px-3 flex flex-col gap-1.5 shadow-inner animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] text-gray-500">
                      <span className="font-semibold text-gray-700 flex items-center gap-1">
                        <span>✨ Toque em um emoji para enviar na hora:</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(false)}
                        className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                        title="Fechar emojis"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto py-1">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSendDirectEmoji(emoji)}
                          className="text-2xl hover:scale-125 transition-transform p-1.5 cursor-pointer rounded hover:bg-sky-50 active:scale-95 shrink-0"
                          title={`Enviar ${emoji} diretamente`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Input & Media Toolbar */}
                <div className="p-2 sm:p-3 bg-white border-t border-gray-200 shrink-0">
                  {isRecordingAudio ? (
                    /* Live Audio Recording Toolbar */
                    <div className="flex items-center justify-between bg-rose-50 border border-rose-200 rounded-md px-3 py-2 animate-in fade-in duration-200">
                      <div className="flex items-center gap-2.5">
                        <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
                        <span className="text-xs font-bold text-rose-800">
                          Gravando mensagem de voz ({recordingSeconds}s)...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={cancelRecordingAudio}
                          className="px-2.5 py-1 text-xs font-semibold text-gray-600 hover:text-red-600 bg-white border border-gray-200 rounded-sm"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={stopRecordingAudio}
                          className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-sm flex items-center gap-1 shadow-xs"
                        >
                          <Square className="w-3 h-3 fill-white" />
                          <span>Concluir</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Standard Input Bar with Media Actions */
                    <form onSubmit={handleSendMessage} className="flex items-center gap-1 sm:gap-2">
                      {/* Media Action Buttons */}
                      <div className="flex items-center gap-0.5 text-gray-500">
                        {/* Emoji Toggle */}
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker((v) => !v)}
                          className={`p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${
                            showEmojiPicker ? 'text-[#0098d9] bg-sky-50' : ''
                          }`}
                          title="Emojis"
                        >
                          <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Send Image */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 hover:text-emerald-600 transition-colors"
                          title="Enviar foto / imagem"
                        >
                          <Image className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Send Video */}
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 hover:text-purple-600 transition-colors"
                          title="Enviar vídeo"
                        >
                          <Video className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        {/* Record Audio */}
                        <button
                          type="button"
                          onClick={startRecordingAudio}
                          className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 hover:text-rose-600 transition-colors"
                          title="Gravar áudio"
                        >
                          <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                      {/* Text Input */}
                      <input
                        type="text"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:border-[#0098d9] focus:bg-white text-gray-800"
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={(!textInput.trim() && !pendingMedia) || sending}
                        className="px-3 sm:px-4 py-2 bg-[#0098d9] hover:bg-[#0077aa] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
                        title="Enviar mensagem"
                      >
                        <Send className="w-4 h-4" />
                        <span className="hidden sm:inline text-xs">Enviar</span>
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                <MessageSquare className="w-12 h-12 stroke-[1.5] mb-2 text-gray-300" />
                <h3 className="text-sm font-bold text-gray-700">Selecione uma conversa</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Escolha um contato na lista à esquerda para interagir por chat com texto, áudio, fotos e vídeos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Custom Audio Player Bubble for Chat
 */
const ChatAudioPlayer: React.FC<{ audioUrl: string; isMe: boolean }> = ({
  audioUrl,
  isMe
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      className={`flex items-center gap-2.5 p-2 rounded-md my-1 select-none min-w-[180px] sm:min-w-[220px] ${
        isMe ? 'bg-sky-700/40 text-white' : 'bg-gray-100 text-gray-800'
      }`}
    >
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer ${
          isMe
            ? 'bg-white text-[#0098d9] hover:bg-sky-50'
            : 'bg-[#0098d9] text-white hover:bg-[#0077aa]'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform Visualization Bars */}
      <div className="flex-1 flex items-center gap-0.5 h-5">
        {[40, 70, 90, 60, 100, 50, 80, 45, 95, 65, 30, 85, 55, 75].map((h, i) => {
          const progress = duration > 0 ? (currentTime / duration) * 14 : 0;
          const isPassed = i <= progress;
          return (
            <span
              key={i}
              className={`w-1 rounded-full transition-colors ${
                isPassed
                  ? isMe
                    ? 'bg-white'
                    : 'bg-[#0098d9]'
                  : isMe
                  ? 'bg-white/40'
                  : 'bg-gray-300'
              }`}
              style={{ height: `${h}%` }}
            />
          );
        })}
      </div>

      <span className="text-[10px] font-mono shrink-0">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
};
