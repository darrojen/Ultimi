// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import Box from "@/components/ui/box";
// import {
//   Check,
//   CheckCheck,
//   ChevronDown,
//   Pause,
//   Play,
//   Reply,
//   Trash,
//   SmilePlus,
//   Ban,
//   Mic,
// } from "lucide-react";
// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import { Message, MessageReaction } from "@/lib/types";
// import { supabase } from "@/lib/supabaseClient";
// import { formatDistanceToNow, differenceInCalendarDays, isToday, isYesterday, format } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";
// import WaveSurfer from "wavesurfer.js";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/ popover";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { reactions, getPopularReactions } from "@/lib/reactions";
// import {MessageListProps} from '../../../lib/types'


// // AudioWaveform Component
// function AudioWaveform({ 
//   src, 
//   isSender,
//   avatarUrl 
// }: { 
//   src: string; 
//   isSender: boolean;
//   avatarUrl?: string;
// }) {
//   const waveformRef = useRef<HTMLDivElement>(null);
//   const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   useEffect(() => {
//     if (!waveformRef.current) return;
//     const ws = WaveSurfer.create({
//       container: waveformRef.current,
//       // waveColor: "#d1fae5",
//       waveColor: "#526c5fff",
//       progressColor: "#16a34a",
//       height: 48,
//       barWidth: 3,
//       cursorWidth: 0,
//       normalize: true,
//     });
//     ws.load(src);
//     ws.on("finish", () => setIsPlaying(false));
//     ws.on("ready", () => {
//       const dur = ws.getDuration();
//       setDuration(dur);
//     });
//     ws.on("play", () => setIsPlaying(true));
//     ws.on("pause", () => setIsPlaying(false));
//     setWaveSurfer(ws);
//     return () => ws.destroy();
//   }, [src]);

//   const togglePlay = () => {
//     if (!waveSurfer) return;
//     waveSurfer.playPause();
//   };

//   return (
//     <div className="flex w-[230px] flex-col items-start sm:w-[270px]">
//       <div className="flex items-center gap-2 w-full">
//         <Button
//           onClick={togglePlay}
//           className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center"
//         >
//           {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//         </Button>
//         <div ref={waveformRef} className="flex-1" />
//         <span className="text-xs text-gray-500 min-w-[40px] text-right whitespace-nowrap">
//           {duration > 0 ? formatTime(duration) : '0:00'}
//         </span>
//       </div>
//       {!isSender && avatarUrl && (
//         <div className="flex items-center gap-2 mt-1 ml-12">
//           <Avatar className="h-10 w-10 relative">
//             <AvatarImage src={avatarUrl} />
//             <Mic className="absolute bottom-0.5 -right-0.5 h-5 w-5 text-blue-500 bg-white rounded-full p-0.5" />
//           </Avatar>
//         </div>
//       )}
//     </div>
//   );
// }

// // Hook to fetch avatars
// function useAvatars(messages: Message[]) {
//   const [avatars, setAvatars] = useState<Record<string, string>>({});
//   useEffect(() => {
//     const userIds = Array.from(new Set(messages.map(msg => msg.sender_id)));
//     if (!userIds.length) return;
//     const fetchAvatars = async () => {
//       const { data, error } = await supabase.from("profiles").select("id, avatar_url").in("id", userIds);
//       if (error) {
//         console.error("Failed to fetch avatars:", error);
//         return;
//       }
//       const avatarsMap: Record<string, string> = {};
//       data?.forEach(profile => {
//         if (profile.id && profile.avatar_url) avatarsMap[profile.id] = profile.avatar_url;
//       });
//       setAvatars(avatarsMap);
//     };
//     fetchAvatars();
//   }, [messages]);
//   return avatars;
// }

// // Hook to delete messages
// function useDeleteMessage() {
//   const queryClient = useQueryClient();
//   const [deletedMessages, setDeletedMessages] = useState<Record<string, boolean>>({});

//   const mutation = useMutation({
//     mutationFn: async (messageId: string) => {
//       const { error } = await supabase.from("messages").delete().eq("id", messageId);
//       if (error) throw new Error(error.message);
//       return messageId;
//     },
//     onSuccess: (messageId: string) => {
//       setDeletedMessages(prev => ({ ...prev, [messageId]: true }));
//       queryClient.invalidateQueries({ queryKey: ["messages"] });
//       toast.success("Message deleted");
//     },
//     onError: (err: any) => {
//       console.error("Delete message failed:", err);
//       toast.error("Failed to delete message");
//     },
//   });

//   const deleteMessage = (messageId: string) => mutation.mutate(messageId);
//   return { deleteMessage, deletedMessages };
// }

// export function MessageList({
//   chatUserId,
//   currentUserId,
//   messages,
//   handleReply,
//   showScrollDown,
//   scrollToBottom,
//   messageContainerRef,
//   messagesEndRef,
// }: MessageListProps) {
//   const avatars = useAvatars(messages);
//   const { deleteMessage, deletedMessages } = useDeleteMessage();
//   const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
//   const [openReactionFor, setOpenReactionFor] = useState<string | null>(null);

//   const fetchMessageReactions = useCallback(async () => {
//     if (!messages.length || !currentUserId) return;
//     const messageIds = messages.map(m => m.id);
//     const { data, error } = await supabase
//       .from('messages_reactions')
//       .select('id, message_id, user_id, emoji, created_at')
//       .in('message_id', messageIds);
//     if (error) {
//       console.error('Error fetching reactions:', error);
//       return;
//     }
//     const grouped: Record<string, MessageReaction[]> = {};
//     data?.forEach(r => {
//       if (!grouped[r.message_id]) grouped[r.message_id] = [];
//       grouped[r.message_id].push(r);
//     });
//     setMessageReactions(grouped);
//   }, [messages, currentUserId]);

//   useEffect(() => {
//     fetchMessageReactions();
//   }, [fetchMessageReactions]);

//   const addMessageReactionMutation = useMutation({
//     mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
//       if (!currentUserId) throw new Error('Not logged in');
//       const { data: existing } = await supabase
//         .from('messages_reactions')
//         .select('id, emoji')
//         .eq('message_id', messageId)
//         .eq('user_id', currentUserId)
//         .single();
//       if (existing) {
//         if (existing.emoji === emoji) {
//           // remove
//           const { error: deleteError } = await supabase
//             .from('messages_reactions')
//             .delete()
//             .eq('id', existing.id);
//           if (deleteError) throw deleteError;
//         } else {
//           // replace
//           const { error: deleteError } = await supabase
//             .from('messages_reactions')
//             .delete()
//             .eq('id', existing.id);
//           if (deleteError) throw deleteError;
//           const { error: insertError } = await supabase
//             .from('messages_reactions')
//             .insert({
//               message_id: messageId,
//               user_id: currentUserId,
//               emoji,
//             });
//           if (insertError) throw insertError;
//         }
//       } else {
//         // add
//         const { error } = await supabase
//           .from('messages_reactions')
//           .insert({
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//           });
//         if (error) throw error;
//       }
//     },
//     onMutate: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
//       const previous = { ...messageReactions };
//       const current = messageReactions[messageId] || [];
//       const userExisting = current.find(r => r.user_id === currentUserId);
//       let updatedReactions;
//       if (userExisting) {
//         if (userExisting.emoji === emoji) {
//           // remove
//           updatedReactions = current.filter(r => r.id !== userExisting.id);
//         } else {
//           // replace
//           updatedReactions = current.filter(r => r.user_id !== currentUserId).concat({
//             id: `temp-${Date.now()}-${emoji}`,
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//             created_at: new Date().toISOString(),
//           });
//         }
//       } else {
//         // add
//         updatedReactions = [
//           ...current,
//           {
//             id: `temp-${Date.now()}-${emoji}`,
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//             created_at: new Date().toISOString(),
//           },
//         ];
//       }
//       setMessageReactions(prev => ({ ...prev, [messageId]: updatedReactions }));
//       return { previous };
//     },
//     onError: (err: Error, { messageId }: { messageId: string; emoji: string }, context) => {
//       if (context?.previous) {
//         setMessageReactions(context.previous);
//       }
//       toast.error(err.message || 'Failed to update reaction.');
//     },
//     onSuccess: () => {
//       fetchMessageReactions();
//     },
//   });

//   const groupMessageReactions = (reactions: MessageReaction[]) => {
//     const grouped = reactions.reduce((acc, reaction) => {
//       if (!acc[reaction.emoji]) {
//         acc[reaction.emoji] = [];
//       }
//       acc[reaction.emoji].push(reaction);
//       return acc;
//     }, {} as Record<string, MessageReaction[]>);

//     return Object.entries(grouped)
//       .map(([emoji, reactions]) => ({ emoji, count: reactions.length, reactions }))
//       .sort((a, b) => b.count - a.count);
//   };

//   const renderMessageReactionsDisplay = (reactions: MessageReaction[] | undefined, messageId: string) => {
//     if (!reactions || reactions.length === 0) return null;
//     const groupedReactions = groupMessageReactions(reactions);
//     return (
//       <div className="flex flex-wrap gap-1 mt-1">
//         {groupedReactions.map(({ emoji, count, reactions: reactionList }) => {
//           const userReacted = reactionList.some(r => r.user_id === currentUserId);
//           return (
//             <Button
//               key={emoji}
//               variant="ghost"
//               size="sm"
//               className={`flex items-center gap-1 h-6 px-2 text-xs rounded-full border transition-colors duration-200 ${
//                 userReacted
//                   ? 'bg-blue-100   dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
//                   : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
//               }`}
//               onClick={() => {
//                 addMessageReactionMutation.mutate({ messageId, emoji });
//               }}
//             >
//               <span className="text-sm">{emoji}</span>
//               <span>{count}</span>
//             </Button>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderMessageReactionPicker = (messageId: string, isSender: boolean) => (
//     <Popover open={openReactionFor === messageId} onOpenChange={(open) => setOpenReactionFor(open ? messageId : null)}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
//         >
//           <SmilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-80 p-4" align={isSender ? "end" : "start"}>
//         <Tabs defaultValue="popular" className="w-full">
//           <TabsList className="grid w-full grid-cols-4">
//             <TabsTrigger value="popular">Popular</TabsTrigger>
//             <TabsTrigger value="positive">Positive</TabsTrigger>
//             <TabsTrigger value="fun">Fun</TabsTrigger>
//             <TabsTrigger value="all">All</TabsTrigger>
//           </TabsList>
//           <TabsContent value="popular" className="mt-4">
//             <div className="grid grid-cols-5 gap-2">
//               {getPopularReactions().map((reaction) => (
//                 <Button
//                   key={reaction.emoji}
//                   variant="ghost"
//                   size="sm"
//                   className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                   onClick={() => {
//                     addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
//                   }}
//                   title={reaction.name}
//                 >
//                   {reaction.emoji}
//                 </Button>
//               ))}
//             </div>
//           </TabsContent>
//           <TabsContent value="positive" className="mt-4">
//             <div className="grid grid-cols-5 gap-2">
//               {reactions.filter(r => r.category === 'positive').map((reaction) => (
//                 <Button
//                   key={reaction.emoji}
//                   variant="ghost"
//                   size="sm"
//                   className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                   onClick={() => addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji })}
//                   title={reaction.name}
//                 >
//                   {reaction.emoji}
//                 </Button>
//               ))}
//             </div>
//           </TabsContent>
//           <TabsContent value="fun" className="mt-4">
//             <div className="grid grid-cols-5 gap-2">
//               {reactions.filter(r => r.category === 'fun').map((reaction) => (
//                 <Button
//                   key={reaction.emoji}
//                   variant="ghost"
//                   size="sm"
//                   className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                   onClick={() => addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji })}
//                   title={reaction.name}
//                 >
//                   {reaction.emoji}
//                 </Button>
//               ))}
//             </div>
//           </TabsContent>
//           <TabsContent value="all" className="mt-4">
//             <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
//               {reactions.map((reaction) => (
//                 <Button
//                   key={reaction.emoji}
//                   variant="ghost"
//                   size="sm"
//                   className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                   onClick={() => addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji })}
//                   title={reaction.name}
//                 >
//                   {reaction.emoji}
//                 </Button>
//               ))}
//             </div>
//           </TabsContent>
//         </Tabs>
//       </PopoverContent>
//     </Popover>
//   );

//   // Group messages by date
//   const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
//     const date = new Date(msg.created_at);
//     let label: string;
//     if (isToday(date)) label = "Today";
//     else if (isYesterday(date)) label = "Yesterday";
//     else if (differenceInCalendarDays(new Date(), date) < 7) label = format(date, "EEEE");
//     else label = format(date, "MM/dd/yyyy");
//     if (!acc[label]) acc[label] = [];
//     acc[label].push(msg);
//     return acc;
//   }, {});

//   const isAudioUrl = (url: string) => {
//     try {
//       const u = new URL(url);
//       return u.hostname.includes("supabase.co") && u.pathname.includes("/audio-messages/");
//     } catch {
//       return false;
//     }
//   };

//   return (
//     <Box ref={messageContainerRef} className="flex-1 overflow-y-auto p-4  bg-repeat bg-contain">
//       {!chatUserId ? (
//         <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
//           Select a chat to start messaging.
//         </Box>
//       ) : messages.length === 0 ? (
//         <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
//           No messages yet. Say hello!
//         </Box>
//       ) : (
//         <Box className="space-y-6 max-w-4xl  mx-auto">
//           {Object.entries(groupedMessages).map(([dateLabel, dayMessages]) => (
//             <Box key={dateLabel}>
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.2 }}
//                 className="sticky top-2 flex justify-center z-10"
//               >
//                 <Box as="span" className="bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded-full shadow">
//                   {dateLabel}
//                 </Box>
//               </motion.div>

//               <Box className="space-y-3 mt-2 ">
//                 {dayMessages.map(msg => {
//                   const isSender = msg.sender_id === currentUserId;
//                   const avatarUrl = avatars[msg.sender_id];
//                   const isDeleted = deletedMessages[msg.id];
//                   const isPotentialAudio = isAudioUrl(msg.content || "");
//                   const audioSrc =
//                     typeof msg.content === "string" &&
//                     msg.content.trim() &&
//                     (msg.type === "audio" || isPotentialAudio)
//                       ? msg.content
//                       : null;

//                   return (
//                     <Box key={msg.id} className={`flex items-end gap-2 relative ${isSender ? "justify-end" : "justify-start "}`}>
//                       {/* <Box className={`relative flex flex-col text-black p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm group ${isSender ? "bg-green-200 text-gray-900" : "text-black bg-white dark:bg-gray-800 text-white "}`}> */}
//                       <Box
//                       className={`relative flex flex-col p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm group ${
//                         isSender
//                           ? "bg-green-200 text-gray-900"
//                           : "bg-white text-black dark:bg-gray-800 dark:text-white"
//                       }`}
//                     >

//                         {/* Tail */}
//                         <Box className={`absolute top-2 w-4 h-4 ${isSender ? "right-[-6px] bg-green-200 rounded-br-full" : "left-[-6px] bg-white rounded-bl-full dark:bg-gray-800"}`} />

//                         {/* Reply preview */}
//                         {msg.parent_message_id && !isDeleted && (
//                           <Box className="bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg mb-2">
//                             <Box as="p" className="text-xs text-gray-600 dark:text-gray-400 dark:text-white">
//                               Replying to: {messages.find(m => m.id === msg.parent_message_id)?.content.slice(0, 50) || "Message"}
//                             </Box>
//                           </Box>
//                         )}

//                         {/* Message content */}
//                         {isDeleted ? (
//                           <Box className="flex items-center gap-2 text-gray-500">
//                             <Ban className="w-4 h-4" /> Deleted message
//                           </Box>
//                         ) : audioSrc ? (
//                           <AudioWaveform src={audioSrc} isSender={isSender} avatarUrl={avatarUrl} />
//                         ) : (
//                           <Box as="p" className="text-sm w-[250px] sm:text-base break-words sm:w-[300px]">{msg.content || "No content available"}</Box>
//                         )}

//                         {/* Timestamp + read */}
//                         {!isDeleted && (
//                           <Box className="flex items-center gap-1 mt-1 text-xs text-gray-500 ">
//                             <Box as="span">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</Box>
//                             {isSender && (msg.is_read ? <CheckCheck className="h-4 w-4 text-blue-500" /> : <Check className="h-4 w-4 text-gray-500" />)}
//                           </Box>
//                         )}

//                         {/* Hover Dropdown */}
//                         {!isDeleted && (
//                           <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon"><ChevronDown className="w-4 h-4" /></Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent side="bottom" align="end" className="w-32">
//                                 <DropdownMenuItem onClick={() => handleReply(msg)}><Reply className="w-4 h-4 mr-2" /> Reply</DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => deleteMessage(msg.id)}><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </Box>
//                         )}

//                         {/* Hover Reaction Trigger */}
//                         {!isDeleted && (
//                           <Box className={`absolute bottom-2 ${isSender ? 'right-2' : 'left-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
//                             {renderMessageReactionPicker(msg.id, isSender)}
//                           </Box>
//                         )}
//                       </Box>
//                       {renderMessageReactionsDisplay(messageReactions[msg.id], msg.id)}
//                     </Box>
//                   );
//                 })}
//               </Box>
//             </Box>
//           ))}
//           <Box ref={messagesEndRef} />
//         </Box>
//       )}

//       {/* Scroll to bottom button */}
//       <AnimatePresence>
//         {showScrollDown && (
//           <motion.div
//             key="scroll-button"
//             initial={{ opacity: 0, y: 20, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.9 }}
//             transition={{ duration: 0.25, type: "spring" }}
//             className="fixed bottom-24 right-4 z-40"
//           >
//             <Box className="relative">
//               <motion.span
//                 animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
//                 transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
//                 className="absolute inset-0 rounded-full bg-blue-400/30"
//               />
//               <motion.span
//                 animate={{ scale: [1, 2.2], opacity: [0.35, 0] }}
//                 transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.4 }}
//                 className="absolute inset-0 rounded-full bg-blue-400/30"
//               />
//               <Button variant="outline" size="icon" className="rounded-full shadow-lg relative z-10" onClick={scrollToBottom}>
//                 <ChevronDown className="h-5 w-5" />
//               </Button>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </Box>
    
//   );
// }



// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import Box from "@/components/ui/box";
// import {
//   Check,
//   CheckCheck,
//   ChevronDown,
//   Pause,
//   Play,
//   Reply,
//   Trash,
//   SmilePlus,
//   Ban,
//   Mic,
//   Clock,
// } from "lucide-react";
// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Message, MessageReaction } from "@/lib/types";
// import { supabase } from "@/lib/supabaseClient";
// import { formatDistanceToNow, differenceInCalendarDays, isToday, isYesterday, format } from "date-fns";
// import { motion, AnimatePresence } from "framer-motion";
// import WaveSurfer from "wavesurfer.js";
// import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
// import { toast } from "sonner";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/ popover";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { reactions, getPopularReactions } from "@/lib/reactions";
// import {MessageListProps} from '../../../lib/types'

// // ReactionPicker Component
// function ReactionPicker({ 
//   messageId, 
//   isSender, 
//   addMessageReactionMutation,
//   openReactionFor,
//   setOpenReactionFor 
// }: { 
//   messageId: string;
//   isSender: boolean;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   addMessageReactionMutation: any;
//   openReactionFor: string | null;
//   setOpenReactionFor: (id: string | null) => void;
// }) {
//   const [showFull, setShowFull] = useState(false);
//   const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

//   const handleQuickReaction = (emoji: string) => {
//     addMessageReactionMutation.mutate({ messageId, emoji });
//     setOpenReactionFor(null);
//   };

//   useEffect(() => {
//     if (openReactionFor !== messageId) {
//       setShowFull(false);
//     }
//   }, [openReactionFor, messageId]);

//   return (
//     <Popover open={openReactionFor === messageId} onOpenChange={(open) => setOpenReactionFor(open ? messageId : null)}>
//       <PopoverTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
//         >
//           <SmilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-80 p-0" align={isSender ? "end" : "start"}>
//         <AnimatePresence mode="wait">
//           {!showFull ? (
//             <motion.div
//               key="quick"
//               initial={{ opacity: 0, scale: 0.95, y: -10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: 10 }}
//               transition={{ duration: 0.15, ease: "easeOut" }}
//               className="flex items-center justify-around p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
//             >
//               {quickReactions.map((emoji, index) => (
//                 <motion.div
//                   key={emoji}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ duration: 0.2, delay: index * 0.05 }}
//                 >
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     className="h-12 w-12 p-0 text-2xl hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
//                     onClick={() => handleQuickReaction(emoji)}
//                   >
//                     {emoji}
//                   </Button>
//                 </motion.div>
//               ))}
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ duration: 0.2, delay: quickReactions.length * 0.05 }}
//               >
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-12 w-12 p-0 text-xl hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
//                   onClick={() => setShowFull(true)}
//                 >
//                   +
//                 </Button>
//               </motion.div>
//             </motion.div>
//           ) : (
//             <motion.div
//               key="full"
//               initial={{ opacity: 0, scale: 0.95, y: 10 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.95, y: -10 }}
//               transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 35 }}
//               className="p-4 max-h-96 overflow-y-auto"
//             >
//               <Tabs defaultValue="popular" className="w-full">
//                 <TabsList className="grid w-full grid-cols-4">
//                   <TabsTrigger value="popular">Popular</TabsTrigger>
//                   <TabsTrigger value="positive">Positive</TabsTrigger>
//                   <TabsTrigger value="fun">Fun</TabsTrigger>
//                   <TabsTrigger value="all">All</TabsTrigger>
//                 </TabsList>
//                 <TabsContent value="popular" className="mt-4">
//                   <div className="grid grid-cols-5 gap-2">
//                     {getPopularReactions().map((reaction) => (
//                       <Button
//                         key={reaction.emoji}
//                         variant="ghost"
//                         size="sm"
//                         className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                         onClick={() => {
//                           addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
//                           setOpenReactionFor(null);
//                         }}
//                         title={reaction.name}
//                       >
//                         {reaction.emoji}
//                       </Button>
//                     ))}
//                   </div>
//                 </TabsContent>
//                 <TabsContent value="positive" className="mt-4">
//                   <div className="grid grid-cols-5 gap-2">
//                     {reactions.filter(r => r.category === 'positive').map((reaction) => (
//                       <Button
//                         key={reaction.emoji}
//                         variant="ghost"
//                         size="sm"
//                         className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                         onClick={() => {
//                           addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
//                           setOpenReactionFor(null);
//                         }}
//                         title={reaction.name}
//                       >
//                         {reaction.emoji}
//                       </Button>
//                     ))}
//                   </div>
//                 </TabsContent>
//                 <TabsContent value="fun" className="mt-4">
//                   <div className="grid grid-cols-5 gap-2">
//                     {reactions.filter(r => r.category === 'fun').map((reaction) => (
//                       <Button
//                         key={reaction.emoji}
//                         variant="ghost"
//                         size="sm"
//                         className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                         onClick={() => {
//                           addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
//                           setOpenReactionFor(null);
//                         }}
//                         title={reaction.name}
//                       >
//                         {reaction.emoji}
//                       </Button>
//                     ))}
//                   </div>
//                 </TabsContent>
//                 <TabsContent value="all" className="mt-4">
//                   <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
//                     {reactions.map((reaction) => (
//                       <Button
//                         key={reaction.emoji}
//                         variant="ghost"
//                         size="sm"
//                         className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
//                         onClick={() => {
//                           addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
//                           setOpenReactionFor(null);
//                         }}
//                         title={reaction.name}
//                       >
//                         {reaction.emoji}
//                       </Button>
//                     ))}
//                   </div>
//                 </TabsContent>
//               </Tabs>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </PopoverContent>
//     </Popover>
//   );
// }

// // Skeleton Message Component
// function SkeletonMessage({ isSender }: { isSender: boolean }) {
//   return (
//     <Box className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
//       <Box className={`relative flex flex-col p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm animate-pulse ${
//         isSender ? "bg-green-200" : "bg-gray-100 dark:bg-gray-700"
//       }`}>
//         <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
//         <div className="h-4 bg-gray-300 rounded w-1/2" />
//         <div className="h-3 bg-gray-300 rounded w-1/4 mt-2" />
//       </Box>
//     </Box>
//   );
// }

// // AudioWaveform Component
// function AudioWaveform({ 
//   src, 
//   isSender,
//   avatarUrl,
//   handlePlayStart
// }: { 
//   src: string; 
//   isSender: boolean;
//   avatarUrl?: string;
//   handlePlayStart?: (ws: WaveSurfer) => void;
// }) {
//   const waveformRef = useRef<HTMLDivElement>(null);
//   const progressDotRef = useRef<HTMLDivElement>(null);
//   const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [duration, setDuration] = useState(0);

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = Math.floor(seconds % 60);
//     return `${mins}:${secs.toString().padStart(2, '0')}`;
//   };

//   useEffect(() => {
//     if (!waveformRef.current) return;
//     const ws = WaveSurfer.create({
//       container: waveformRef.current,
//       waveColor: "#526c5fff",
//       progressColor: "#16a34a",
//       cursorWidth: 0,
//       height: 48,
//       barWidth: 3,
//       normalize: true,
//     });
//     ws.load(src);
//     ws.on("finish", () => {
//       setIsPlaying(false);
//       ws.seekTo(0);
//     });
//     ws.on("ready", () => {
//       const dur = ws.getDuration();
//       setDuration(dur);
//     });
//     ws.on("play", () => {
//       handlePlayStart?.(ws);
//       setIsPlaying(true);
//     });
//     ws.on("pause", () => setIsPlaying(false));
//     ws.on("audioprocess", () => {
//       if (progressDotRef.current && ws) {
//         const progress = ws.getCurrentTime() / ws.getDuration();
//         const width = waveformRef.current?.clientWidth || 0;
//         progressDotRef.current.style.left = `${progress * (width - 4)}px`; // -4 for dot width
//       }
//     });
//     setWaveSurfer(ws);
//     return () => ws.destroy();
//   }, [src, handlePlayStart]);

//   const togglePlay = () => {
//     if (!waveSurfer) return;
//     waveSurfer.playPause();
//   };

//   return (
//     <div className="flex w-[230px] flex-col items-start sm:w-[270px]">
//       <div className="flex items-center gap-2 w-full relative">
//         <Button
//           onClick={togglePlay}
//           className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center z-10"
//         >
//           {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
//         </Button>
//         <div ref={waveformRef} className="flex-1 relative">
//           <div 
//             ref={progressDotRef}
//             className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full z-10 opacity-0 pointer-events-none"
//             style={{ opacity: isPlaying ? 1 : 0 }}
//           />
//         </div>
//         <span className="text-xs text-gray-500 min-w-[40px] text-right whitespace-nowrap z-10">
//           {duration > 0 ? formatTime(duration) : '0:00'}
//         </span>
//       </div>
//       {!isSender && avatarUrl && (
//         <div className="flex items-center gap-2 mt-1 ml-12">
//           <Avatar className="h-10 w-10 relative">
//             <AvatarImage src={avatarUrl} />
//             <Mic className="absolute bottom-0.5 -right-0.5 h-5 w-5 text-blue-500 bg-white rounded-full p-0.5" />
//           </Avatar>
//         </div>
//       )}
//     </div>
//   );
// }

// // Hook to fetch avatars
// function useAvatars(messages: Message[]) {
//   const [avatars, setAvatars] = useState<Record<string, string>>({});
//   useEffect(() => {
//     const userIds = Array.from(new Set(messages.map(msg => msg.sender_id)));
//     if (!userIds.length) return;
//     const fetchAvatars = async () => {
//       const { data, error } = await supabase.from("profiles").select("id, avatar_url").in("id", userIds);
//       if (error) {
//         console.error("Failed to fetch avatars:", error);
//         return;
//       }
//       const avatarsMap: Record<string, string> = {};
//       data?.forEach(profile => {
//         if (profile.id && profile.avatar_url) avatarsMap[profile.id] = profile.avatar_url;
//       });
//       setAvatars(avatarsMap);
//     };
//     fetchAvatars();
//   }, [messages]);
//   return avatars;
// }

// // Hook to delete messages
// function useDeleteMessage() {
//   const queryClient = useQueryClient();
//   const [deletedMessages, setDeletedMessages] = useState<Record<string, boolean>>({});

//   const mutation = useMutation({
//     mutationFn: async (messageId: string) => {
//       const { error } = await supabase.from("messages").delete().eq("id", messageId);
//       if (error) throw new Error(error.message);
//       return messageId;
//     },
//     onSuccess: (messageId: string) => {
//       setDeletedMessages(prev => ({ ...prev, [messageId]: true }));
//       queryClient.invalidateQueries({ queryKey: ["messages"] });
//       toast.success("Message deleted");
//     },
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     onError: (err: any) => {
//       console.error("Delete message failed:", err);
//       toast.error("Failed to delete message");
//     },
//   });

//   const deleteMessage = (messageId: string) => mutation.mutate(messageId);
//   return { deleteMessage, deletedMessages };
// }

// export function MessageList({
//   chatUserId,
//   currentUserId,
//   messages,
//   handleReply,
//   showScrollDown,
//   scrollToBottom,
//   messageContainerRef,
//   messagesEndRef,
//   isLoading = false,
// }: MessageListProps & { isLoading?: boolean }) {
//   const avatars = useAvatars(messages);
//   const { deleteMessage, deletedMessages } = useDeleteMessage();
//   const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
//   const [openReactionFor, setOpenReactionFor] = useState<string | null>(null);
//   const currentWaveSurferRef = useRef<WaveSurfer | null>(null);
//   const handlePlayStart = useCallback((ws: WaveSurfer) => {
//     if (currentWaveSurferRef.current && currentWaveSurferRef.current !== ws) {
//       currentWaveSurferRef.current.pause();
//     }
//     currentWaveSurferRef.current = ws;
//   }, []);

//   const fetchMessageReactions = useCallback(async () => {
//     if (!messages.length || !currentUserId) return;
//     const messageIds = messages.map(m => m.id);
//     const { data, error } = await supabase
//       .from('messages_reactions')
//       .select('id, message_id, user_id, emoji, created_at')
//       .in('message_id', messageIds);
//     if (error) {
//       console.error('Error fetching reactions:', error);
//       return;
//     }
//     const grouped: Record<string, MessageReaction[]> = {};
//     data?.forEach(r => {
//       if (!grouped[r.message_id]) grouped[r.message_id] = [];
//       grouped[r.message_id].push(r);
//     });
//     setMessageReactions(grouped);
//   }, [messages, currentUserId]);

//   useEffect(() => {
//     fetchMessageReactions();
//   }, [fetchMessageReactions]);

//   const addMessageReactionMutation = useMutation({
//     mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
//       if (!currentUserId) throw new Error('Not logged in');
//       const { data: existing } = await supabase
//         .from('messages_reactions')
//         .select('id, emoji')
//         .eq('message_id', messageId)
//         .eq('user_id', currentUserId)
//         .single();
//       if (existing) {
//         if (existing.emoji === emoji) {
//           // remove
//           const { error: deleteError } = await supabase
//             .from('messages_reactions')
//             .delete()
//             .eq('id', existing.id);
//           if (deleteError) throw deleteError;
//         } else {
//           // replace
//           const { error: deleteError } = await supabase
//             .from('messages_reactions')
//             .delete()
//             .eq('id', existing.id);
//           if (deleteError) throw deleteError;
//           const { error: insertError } = await supabase
//             .from('messages_reactions')
//             .insert({
//               message_id: messageId,
//               user_id: currentUserId,
//               emoji,
//             });
//           if (insertError) throw insertError;
//         }
//       } else {
//         // add
//         const { error } = await supabase
//           .from('messages_reactions')
//           .insert({
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//           });
//         if (error) throw error;
//       }
//     },
//     onMutate: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
//       const previous = { ...messageReactions };
//       const current = messageReactions[messageId] || [];
//       const userExisting = current.find(r => r.user_id === currentUserId);
//       let updatedReactions;
//       if (userExisting) {
//         if (userExisting.emoji === emoji) {
//           // remove
//           updatedReactions = current.filter(r => r.id !== userExisting.id);
//         } else {
//           // replace
//           updatedReactions = current.filter(r => r.user_id !== currentUserId).concat({
//             id: `temp-${Date.now()}-${emoji}`,
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//             created_at: new Date().toISOString(),
//           });
//         }
//       } else {
//         // add
//         updatedReactions = [
//           ...current.filter(r => r.user_id !== currentUserId),
//           {
//             id: `temp-${Date.now()}-${emoji}`,
//             message_id: messageId,
//             user_id: currentUserId,
//             emoji,
//             created_at: new Date().toISOString(),
//           },
//         ];
//       }
//       setMessageReactions(prev => ({ ...prev, [messageId]: updatedReactions }));
//       return { previous };
//     },
//     onError: (err: Error, { messageId }: { messageId: string; emoji: string }, context) => {
//       console.log(messageId)
//       if (context?.previous) {
//         setMessageReactions(context.previous);
//       }
//       toast.error(err.message || 'Failed to update reaction.');
//     },
//     onSuccess: () => {
//       fetchMessageReactions();
//     },
//   });

//   const groupMessageReactions = (reactions: MessageReaction[]) => {
//     const grouped = reactions.reduce((acc, reaction) => {
//       if (!acc[reaction.emoji]) {
//         acc[reaction.emoji] = [];
//       }
//       acc[reaction.emoji].push(reaction);
//       return acc;
//     }, {} as Record<string, MessageReaction[]>);

//     return Object.entries(grouped)
//       .map(([emoji, reactions]) => ({ emoji, count: reactions.length, reactions }))
//       .sort((a, b) => b.count - a.count);
//   };

//   const renderMessageReactionsDisplay = (reactions: MessageReaction[] | undefined, messageId: string, isSender: boolean) => {
//     if (!reactions || reactions.length === 0) return null;
//     const groupedReactions = groupMessageReactions(reactions);
//     return (
//       <div className={`flex flex-wrap gap-1 -mt-2.5 z-20 ${isSender ? 'self-end' : 'self-start'} w-full sm:w-auto`}>
//         {groupedReactions.map(({ emoji, count, reactions: reactionList }) => {
//           const userReacted = reactionList.some(r => r.user_id === currentUserId);
//           return (
//             <Button
//               key={emoji}
//               variant="ghost"
//               size="sm"
//               className={`flex items-center gap-1 h-5 px-1.5 text-xs rounded-full border transition-colors duration-200 min-w-0 ${
//                 userReacted
//                   ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
//                   : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
//               }`}
//               onClick={() => {
//                 addMessageReactionMutation.mutate({ messageId, emoji });
//               }}
//             >
//               <span className="text-sm truncate">{emoji}</span>
//               {count > 1 && <span className="ml-0.5">{count}</span>}
//             </Button>
//           );
//         })}
//       </div>
//     );
//   };

//   const renderMessageReactionPicker = (messageId: string, isSender: boolean, isDeleted: boolean) => {
//     if (isDeleted) return null;
//     return (
//       <ReactionPicker
//         messageId={messageId}
//         isSender={isSender}
//         addMessageReactionMutation={addMessageReactionMutation}
//         openReactionFor={openReactionFor}
//         setOpenReactionFor={setOpenReactionFor}
//       />
//     );
//   };

//   // Group messages by date
//   const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
//     const date = new Date(msg.created_at);
//     let label: string;
//     if (isToday(date)) label = "Today";
//     else if (isYesterday(date)) label = "Yesterday";
//     else if (differenceInCalendarDays(new Date(), date) < 7) label = format(date, "EEEE");
//     else label = format(date, "MM/dd/yyyy");
//     if (!acc[label]) acc[label] = [];
//     acc[label].push(msg);
//     return acc;
//   }, {});

//   const isAudioUrl = (url: string) => {
//     try {
//       const u = new URL(url);
//       return u.hostname.includes("supabase.co") && u.pathname.includes("/audio-messages/");
//     } catch {
//       return false;
//     }
//   };

//   if (isLoading) {
//     return (
//       <Box ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 bg-repeat bg-contain">
//         <Box className="space-y-6 max-w-4xl mx-auto">
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.2 }}
//             className="sticky top-2 flex justify-center z-10"
//           >
//             <Skeleton className="h-6 w-20 rounded-full" />
//           </motion.div>
//           <Box className="space-y-3 mt-2">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <SkeletonMessage key={i} isSender={i % 2 === 0} />
//             ))}
//           </Box>
//         </Box>
//         <Box ref={messagesEndRef} />
//       </Box>
//     );
//   }

//   return (
//     <Box ref={messageContainerRef} className="flex-1 overflow-y-auto p-4  bg-repeat bg-contain">
//       {!chatUserId ? (
//         <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
//           Select a chat to start messaging.
//         </Box>
//       ) : messages.length === 0 ? (
//         <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
//           No messages yet. Say hello!
//         </Box>
//       ) : (
//         <Box className="space-y-6 max-w-4xl  mx-auto">
//           {Object.entries(groupedMessages).map(([dateLabel, dayMessages]) => (
//             <Box key={dateLabel}>
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.2 }}
//                 className="sticky top-2 flex justify-center z-10"
//               >
//                 <Box as="span" className="bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded-full shadow">
//                   {dateLabel}
//                 </Box>
//               </motion.div>

//               <Box className="space-y-3 mt-2 ">
//                 {dayMessages.map(msg => {
//                   const isSender = msg.sender_id === currentUserId;
//                   const avatarUrl = avatars[msg.sender_id];
//                   const isDeleted = deletedMessages[msg.id];
//                   const isPotentialAudio = isAudioUrl(msg.content || "");
//                   const audioSrc =
//                     typeof msg.content === "string" &&
//                     msg.content.trim() &&
//                     (msg.type === "audio" || isPotentialAudio)
//                       ? msg.content
//                       : null;

//                   return (
//                     <Box key={msg.id} className={`flex flex-col gap-0.5 ${isSender ? "items-end" : "items-start "}`}>
//                       <Box
//                       className={`relative flex flex-col p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm group ${
//                         isSender
//                           ? "bg-green-200 text-gray-900"
//                           : "bg-white text-black dark:bg-gray-800 dark:text-white"
//                       }`}
//                     >

//                         {/* Tail */}
//                         <Box className={`absolute top-2 w-4 h-4 ${isSender ? "right-[-6px] bg-green-200 rounded-br-full" : "left-[-6px] bg-white rounded-bl-full dark:bg-gray-800"}`} />

//                         {/* Reply preview */}
//                         {msg.parent_message_id && !isDeleted && (
//                           <Box className="bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg mb-2">
//                             <Box as="p" className="text-xs text-gray-600 dark:text-gray-400 dark:text-white">
//                               Replying to: {messages.find(m => m.id === msg.parent_message_id)?.content.slice(0, 50) || "Message"}
//                             </Box>
//                           </Box>
//                         )}

//                         {/* Message content */}
//                         {isDeleted ? (
//                           <Box className="flex items-center gap-2 text-gray-500">
//                             <Ban className="w-4 h-4" /> Deleted message
//                           </Box>
//                         ) : audioSrc ? (
//                           <AudioWaveform src={audioSrc} isSender={isSender} avatarUrl={avatarUrl} handlePlayStart={handlePlayStart} />
//                         ) : (
//                           <Box as="p" className="text-sm w-[250px] sm:text-base break-words sm:w-[300px]">{msg.content || "No content available"}</Box>
//                         )}

//                         {/* Timestamp + status */}
//                         {!isDeleted && (
//                           <Box className="flex items-center gap-1 mt-1 text-xs text-gray-500 ">
//                             <Box as="span">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</Box>
//                             {isSender && (
//                               // eslint-disable-next-line @typescript-eslint/no-explicit-any
//                               (msg as any).status === 'pending' ? 
//                               <Clock className="h-4 w-4 text-gray-500" /> :
//                               (msg.is_read ? <CheckCheck className="h-4 w-4 text-blue-500" /> : <Check className="h-4 w-4 text-gray-500" />)
//                             )}
//                           </Box>
//                         )}

//                         {/* Hover Dropdown */}
//                         {!isDeleted && (
//                           <Box className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" size="icon"><ChevronDown className="w-4 h-4" /></Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent side="bottom" align="end" className="w-32">
//                                 <DropdownMenuItem onClick={() => handleReply(msg)}><Reply className="w-4 h-4 mr-2" /> Reply</DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => deleteMessage(msg.id)}><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </Box>
//                         )}

//                         {/* Hover Reaction Trigger */}
//                         {!isDeleted && (
//                           <Box className={`absolute bottom-2 ${isSender ? 'right-2' : 'left-2'} opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}>
//                             {renderMessageReactionPicker(msg.id, isSender, isDeleted)}
//                           </Box>
//                         )}
//                       </Box>
//                       {renderMessageReactionsDisplay(messageReactions[msg.id], msg.id, isSender)}
//                     </Box>
//                   );
//                 })}
//               </Box>
//             </Box>
//           ))}
//           <Box ref={messagesEndRef} />
//         </Box>
//       )}

//       {/* Scroll to bottom button */}
//       <AnimatePresence>
//         {showScrollDown && (
//           <motion.div
//             key="scroll-button"
//             initial={{ opacity: 0, y: 20, scale: 0.9 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.9 }}
//             transition={{ duration: 0.25, type: "spring" }}
//             className="fixed bottom-40 right-4 z-40 sm:bottom-24"
//           >
//             <Box className="relative">
           
            
//               <Button variant="outline" size="icon" className="rounded-full shadow-lg relative z-10" onClick={scrollToBottom}>
//                 <ChevronDown className="h-5 w-5" />
//               </Button>
//             </Box>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </Box>
    
//   );
// }


"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Box from "@/components/ui/box";
import {
  Check,
  CheckCheck,
  ChevronDown,
  MoreHorizontal,
  Pause,
  Play,
  Reply,
  Trash,
  SmilePlus,
  Ban,
  Mic,
  Clock,
} from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Message, MessageReaction } from "@/lib/types";
import { supabase } from "@/lib/supabaseClient";
import { formatDistanceToNow, differenceInCalendarDays, isToday, isYesterday, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import WaveSurfer from "wavesurfer.js";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/ popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { reactions, getPopularReactions } from "@/lib/reactions";
import {MessageListProps} from '../../../lib/types'

// ReactionPicker Component
function ReactionPicker({ 
  messageId, 
  isSender, 
  addMessageReactionMutation,
  openReactionFor,
  setOpenReactionFor 
}: { 
  messageId: string;
  isSender: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addMessageReactionMutation: any;
  openReactionFor: string | null;
  setOpenReactionFor: (id: string | null) => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

  const handleQuickReaction = (emoji: string) => {
    addMessageReactionMutation.mutate({ messageId, emoji });
    setOpenReactionFor(null);
  };

  useEffect(() => {
    if (openReactionFor !== messageId) {
      setShowFull(false);
    }
  }, [openReactionFor, messageId]);

  return (
    <Popover open={openReactionFor === messageId} onOpenChange={(open) => setOpenReactionFor(open ? messageId : null)}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <SmilePlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 sm:w-80 p-0" align="end">
        <AnimatePresence mode="wait">
          {!showFull ? (
            <motion.div
              key="quick"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex items-center justify-around p-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
            >
              {quickReactions.map((emoji, index) => (
                <motion.div
                  key={emoji}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-12 w-12 p-0 text-2xl hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                    onClick={() => handleQuickReaction(emoji)}
                  >
                    {emoji}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: quickReactions.length * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-12 w-12 p-0 text-xl hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                  onClick={() => setShowFull(true)}
                >
                  +
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 35 }}
              className="p-4 max-h-96 overflow-y-auto"
            >
              <Tabs defaultValue="popular" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="popular">Popular</TabsTrigger>
                  <TabsTrigger value="positive">Positive</TabsTrigger>
                  <TabsTrigger value="fun">Fun</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
                <TabsContent value="popular" className="mt-4">
                  <div className="grid grid-cols-5 gap-2">
                    {getPopularReactions().map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
                          setOpenReactionFor(null);
                        }}
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="positive" className="mt-4">
                  <div className="grid grid-cols-5 gap-2">
                    {reactions.filter(r => r.category === 'positive').map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
                          setOpenReactionFor(null);
                        }}
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="fun" className="mt-4">
                  <div className="grid grid-cols-5 gap-2">
                    {reactions.filter(r => r.category === 'fun').map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
                          setOpenReactionFor(null);
                        }}
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="all" className="mt-4">
                  <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
                    {reactions.map((reaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={() => {
                          addMessageReactionMutation.mutate({ messageId, emoji: reaction.emoji });
                          setOpenReactionFor(null);
                        }}
                        title={reaction.name}
                      >
                        {reaction.emoji}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

// Skeleton Message Component
function SkeletonMessage({ isSender }: { isSender: boolean }) {
  return (
    <Box className={`flex items-end gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
      <Box className={`relative flex flex-col p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm animate-pulse ${
        isSender ? "bg-green-200" : "bg-gray-100 dark:bg-gray-700"
      }`}>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
        <div className="h-3 bg-gray-300 rounded w-1/4 mt-2" />
      </Box>
    </Box>
  );
}

// AudioWaveform Component
function AudioWaveform({ 
  src, 
  isSender,
  avatarUrl,
  handlePlayStart
}: { 
  src: string; 
  isSender: boolean;
  avatarUrl?: string;
  handlePlayStart?: (ws: WaveSurfer) => void;
}) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const progressDotRef = useRef<HTMLDivElement>(null);
  const [waveSurfer, setWaveSurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!waveformRef.current) return;
    const ws = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#526c5fff",
      progressColor: "#16a34a",
      cursorWidth: 0,
      height: 48,
      barWidth: 3,
      normalize: true,
    });
    ws.load(src);
    ws.on("finish", () => {
      setIsPlaying(false);
      ws.seekTo(0);
    });
    ws.on("ready", () => {
      const dur = ws.getDuration();
      setDuration(dur);
    });
    ws.on("play", () => {
      handlePlayStart?.(ws);
      setIsPlaying(true);
    });
    ws.on("pause", () => setIsPlaying(false));
    ws.on("audioprocess", () => {
      if (progressDotRef.current && ws) {
        const progress = ws.getCurrentTime() / ws.getDuration();
        const width = waveformRef.current?.clientWidth || 0;
        progressDotRef.current.style.left = `${progress * (width - 4)}px`; // -4 for dot width
      }
    });
    setWaveSurfer(ws);
    return () => ws.destroy();
  }, [src, handlePlayStart]);

  const togglePlay = () => {
    if (!waveSurfer) return;
    waveSurfer.playPause();
  };

  return (
    <div className="flex w-[230px] flex-col items-start sm:w-[270px]">
      <div className="flex items-center gap-2 w-full relative">
        <Button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center z-10"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>
        <div ref={waveformRef} className="flex-1 relative">
          <div 
            ref={progressDotRef}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full z-10 opacity-0 pointer-events-none"
            style={{ opacity: isPlaying ? 1 : 0 }}
          />
        </div>
        <span className="text-xs text-gray-500 min-w-[40px] text-right whitespace-nowrap z-10">
          {duration > 0 ? formatTime(duration) : '0:00'}
        </span>
      </div>
      {!isSender && avatarUrl && (
        <div className="flex items-center gap-2 mt-1 ml-12">
          <Avatar className="h-10 w-10 relative">
            <AvatarImage src={avatarUrl} />
            <Mic className="absolute bottom-0.5 -right-0.5 h-5 w-5 text-blue-500 bg-white rounded-full p-0.5" />
          </Avatar>
        </div>
      )}
    </div>
  );
}

// Hook to fetch avatars
function useAvatars(messages: Message[]) {
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  useEffect(() => {
    const userIds = Array.from(new Set(messages.map(msg => msg.sender_id)));
    if (!userIds.length) return;
    const fetchAvatars = async () => {
      const { data, error } = await supabase.from("profiles").select("id, avatar_url").in("id", userIds);
      if (error) {
        console.error("Failed to fetch avatars:", error);
        return;
      }
      const avatarsMap: Record<string, string> = {};
      data?.forEach(profile => {
        if (profile.id && profile.avatar_url) avatarsMap[profile.id] = profile.avatar_url;
      });
      setAvatars(avatarsMap);
    };
    fetchAvatars();
  }, [messages]);
  return avatars;
}

// Hook to delete messages
function useDeleteMessage() {
  const queryClient = useQueryClient();
  const [deletedMessages, setDeletedMessages] = useState<Record<string, boolean>>({});

  const mutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", messageId);
      if (error) throw new Error(error.message);
      return messageId;
    },
    onSuccess: (messageId: string) => {
      setDeletedMessages(prev => ({ ...prev, [messageId]: true }));
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      toast.success("Message deleted");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      console.error("Delete message failed:", err);
      toast.error("Failed to delete message");
    },
  });

  const deleteMessage = (messageId: string) => mutation.mutate(messageId);
  return { deleteMessage, deletedMessages };
}

export function MessageList({
  chatUserId,
  currentUserId,
  messages,
  handleReply,
  showScrollDown,
  scrollToBottom,
  messageContainerRef,
  messagesEndRef,
  isLoading = false,
}: MessageListProps & { isLoading?: boolean }) {
  const avatars = useAvatars(messages);
  const { deleteMessage, deletedMessages } = useDeleteMessage();
  const [messageReactions, setMessageReactions] = useState<Record<string, MessageReaction[]>>({});
  const [openReactionFor, setOpenReactionFor] = useState<string | null>(null);
  const currentWaveSurferRef = useRef<WaveSurfer | null>(null);
  const handlePlayStart = useCallback((ws: WaveSurfer) => {
    if (currentWaveSurferRef.current && currentWaveSurferRef.current !== ws) {
      currentWaveSurferRef.current.pause();
    }
    currentWaveSurferRef.current = ws;
  }, []);

  const fetchMessageReactions = useCallback(async () => {
    if (!messages.length || !currentUserId) return;
    const messageIds = messages.map(m => m.id);
    const { data, error } = await supabase
      .from('messages_reactions')
      .select('id, message_id, user_id, emoji, created_at')
      .in('message_id', messageIds);
    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }
    const grouped: Record<string, MessageReaction[]> = {};
    data?.forEach(r => {
      if (!grouped[r.message_id]) grouped[r.message_id] = [];
      grouped[r.message_id].push(r);
    });
    setMessageReactions(grouped);
  }, [messages, currentUserId]);

  useEffect(() => {
    fetchMessageReactions();
  }, [fetchMessageReactions]);

  const addMessageReactionMutation = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!currentUserId) throw new Error('Not logged in');
      const { data: existing } = await supabase
        .from('messages_reactions')
        .select('id, emoji')
        .eq('message_id', messageId)
        .eq('user_id', currentUserId)
        .single();
      if (existing) {
        if (existing.emoji === emoji) {
          // remove
          const { error: deleteError } = await supabase
            .from('messages_reactions')
            .delete()
            .eq('id', existing.id);
          if (deleteError) throw deleteError;
        } else {
          // replace
          const { error: deleteError } = await supabase
            .from('messages_reactions')
            .delete()
            .eq('id', existing.id);
          if (deleteError) throw deleteError;
          const { error: insertError } = await supabase
            .from('messages_reactions')
            .insert({
              message_id: messageId,
              user_id: currentUserId,
              emoji,
            });
          if (insertError) throw insertError;
        }
      } else {
        // add
        const { error } = await supabase
          .from('messages_reactions')
          .insert({
            message_id: messageId,
            user_id: currentUserId,
            emoji,
          });
        if (error) throw error;
      }
    },
    onMutate: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const previous = { ...messageReactions };
      const current = messageReactions[messageId] || [];
      const userExisting = current.find(r => r.user_id === currentUserId);
      let updatedReactions;
      if (userExisting) {
        if (userExisting.emoji === emoji) {
          // remove
          updatedReactions = current.filter(r => r.id !== userExisting.id);
        } else {
          // replace
          updatedReactions = current.filter(r => r.user_id !== currentUserId).concat({
            id: `temp-${Date.now()}-${emoji}`,
            message_id: messageId,
            user_id: currentUserId,
            emoji,
            created_at: new Date().toISOString(),
          });
        }
      } else {
        // add
        updatedReactions = [
          ...current.filter(r => r.user_id !== currentUserId),
          {
            id: `temp-${Date.now()}-${emoji}`,
            message_id: messageId,
            user_id: currentUserId,
            emoji,
            created_at: new Date().toISOString(),
          },
        ];
      }
      setMessageReactions(prev => ({ ...prev, [messageId]: updatedReactions }));
      return { previous };
    },
    onError: (err: Error, { messageId }: { messageId: string; emoji: string }, context) => {
      console.log(messageId)
      if (context?.previous) {
        setMessageReactions(context.previous);
      }
      toast.error(err.message || 'Failed to update reaction.');
    },
    onSuccess: () => {
      fetchMessageReactions();
    },
  });

  const groupMessageReactions = (reactions: MessageReaction[]) => {
    const grouped = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, MessageReaction[]>);

    return Object.entries(grouped)
      .map(([emoji, reactions]) => ({ emoji, count: reactions.length, reactions }))
      .sort((a, b) => b.count - a.count);
  };

  const renderMessageReactionsDisplay = (reactions: MessageReaction[] | undefined, messageId: string, isSender: boolean) => {
    if (!reactions || reactions.length === 0) return null;
    const groupedReactions = groupMessageReactions(reactions);
    return (
      <div className={`flex flex-wrap gap-1 -mt-2.5 z-20 ${isSender ? 'self-end' : 'self-start'} w-full sm:w-auto`}>
        {groupedReactions.map(({ emoji, count, reactions: reactionList }) => {
          const userReacted = reactionList.some(r => r.user_id === currentUserId);
          return (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={`flex items-center gap-1 h-5 px-1.5 text-xs rounded-full border transition-colors duration-200 min-w-0 ${
                userReacted
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                addMessageReactionMutation.mutate({ messageId, emoji });
              }}
            >
              <span className="text-sm truncate">{emoji}</span>
              {count > 1 && <span className="ml-0.5">{count}</span>}
            </Button>
          );
        })}
      </div>
    );
  };

  const renderMessageReactionPicker = (messageId: string, isSender: boolean, isDeleted: boolean) => {
    if (isDeleted) return null;
    return (
      <ReactionPicker
        messageId={messageId}
        isSender={isSender}
        addMessageReactionMutation={addMessageReactionMutation}
        openReactionFor={openReactionFor}
        setOpenReactionFor={setOpenReactionFor}
      />
    );
  };

  // Group messages by date
  const groupedMessages = messages.reduce<Record<string, Message[]>>((acc, msg) => {
    const date = new Date(msg.created_at);
    let label: string;
    if (isToday(date)) label = "Today";
    else if (isYesterday(date)) label = "Yesterday";
    else if (differenceInCalendarDays(new Date(), date) < 7) label = format(date, "EEEE");
    else label = format(date, "MM/dd/yyyy");
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  const isAudioUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname.includes("supabase.co") && u.pathname.includes("/audio-messages/");
    } catch {
      return false;
    }
  };

  if (isLoading) {
    return (
      <Box ref={messageContainerRef} className="flex-1 overflow-y-auto p-4 bg-repeat bg-contain">
        <Box className="space-y-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky top-2 flex justify-center z-10"
          >
            <Skeleton className="h-6 w-20 rounded-full" />
          </motion.div>
          <Box className="space-y-3 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonMessage key={i} isSender={i % 2 === 0} />
            ))}
          </Box>
        </Box>
        <Box ref={messagesEndRef} />
      </Box>
    );
  }

  return (
    <Box ref={messageContainerRef} className="flex-1 overflow-y-auto p-4  bg-repeat bg-contain">
      {!chatUserId ? (
        <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
          Select a chat to start messaging.
        </Box>
      ) : messages.length === 0 ? (
        <Box as="p" className="text-sm text-gray-500 dark:text-gray-400 text-center mt-20">
          No messages yet. Say hello!
        </Box>
      ) : (
        <Box className="space-y-6 max-w-4xl  mx-auto">
          {Object.entries(groupedMessages).map(([dateLabel, dayMessages]) => (
            <Box key={dateLabel}>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="sticky top-2 flex justify-center z-10"
              >
                <Box as="span" className="bg-gray-200 dark:bg-gray-700 text-xs px-3 py-1 rounded-full shadow">
                  {dateLabel}
                </Box>
              </motion.div>

              <Box className="space-y-3 mt-2 ">
                {dayMessages.map(msg => {
                  const isSender = msg.sender_id === currentUserId;
                  const avatarUrl = avatars[msg.sender_id];
                  const isDeleted = deletedMessages[msg.id];
                  const isPotentialAudio = isAudioUrl(msg.content || "");
                  const audioSrc =
                    typeof msg.content === "string" &&
                    msg.content.trim() &&
                    (msg.type === "audio" || isPotentialAudio)
                      ? msg.content
                      : null;

                  return (
                    <Box key={msg.id} className={`flex flex-col gap-0.5 ${isSender ? "items-end" : "items-start "}`}>
                      <Box
                      className={`relative flex flex-col p-3 max-w-[70%] sm:max-w-[85%] rounded-lg shadow-sm group ${
                        isSender
                          ? "bg-green-200 text-gray-900"
                          : "bg-white text-black dark:bg-gray-800 dark:text-white"
                      }`}
                    >

                        {/* Tail */}
                        <Box className={`absolute top-2 w-4 h-4 ${isSender ? "right-[-6px] bg-green-200 rounded-br-full" : "left-[-6px] bg-white rounded-bl-full dark:bg-gray-800"}`} />

                        {/* Reply preview */}
                        {msg.parent_message_id && !isDeleted && (
                          <Box className="bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg mb-2">
                            <Box as="p" className="text-xs text-gray-600 dark:text-gray-400 dark:text-white">
                              Replying to: {messages.find(m => m.id === msg.parent_message_id)?.content.slice(0, 50) || "Message"}
                            </Box>
                          </Box>
                        )}

                        {/* Message content */}
                        {isDeleted ? (
                          <Box className="flex items-center gap-2 text-gray-500">
                            <Ban className="w-4 h-4" /> Deleted message
                          </Box>
                        ) : audioSrc ? (
                          <AudioWaveform src={audioSrc} isSender={isSender} avatarUrl={avatarUrl} handlePlayStart={handlePlayStart} />
                        ) : (
                          <Box as="p" className="text-sm w-[250px] sm:text-base break-words sm:w-[300px]">{msg.content || "No content available"}</Box>
                        )}

                        {/* Timestamp + status */}
                        {!isDeleted && (
                          <Box className="flex items-center gap-1 mt-1 text-xs text-gray-500 ">
                            <Box as="span">{formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}</Box>
                            {isSender && (
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              (msg as any).status === 'pending' ? 
                              <Clock className="h-4 w-4 text-gray-500" /> :
                              (msg.is_read ? <CheckCheck className="h-4 w-4 text-blue-500" /> : <Check className="h-4 w-4 text-gray-500" />)
                            )}
                          </Box>
                        )}

                        {/* Actions */}
                        {!isDeleted && (
                          <>
                            {/* Small screens: always visible 3 dots menu */}
                            <Box className={`absolute top-2 ${isSender ? 'right-2' : 'left-2'} block sm:hidden`}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align={isSender ? "end" : "start"} className="w-40">
                                  <DropdownMenuItem onClick={() => handleReply(msg)}>
                                    <Reply className="w-4 h-4 mr-2" /> Reply
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteMessage(msg.id)}>
                                    <Trash className="w-4 h-4 mr-2" /> Delete
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setOpenReactionFor(msg.id)}>
                                    <SmilePlus className="w-4 h-4 mr-2" /> React
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </Box>

                            {/* Large screens: hover chevron for reply/delete */}
                            <Box className={`absolute top-2 ${isSender ? 'right-2' : 'left-2'} hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon"><ChevronDown className="w-4 h-4" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent side="bottom" align={isSender ? "end" : "start"} className="w-32">
                                  <DropdownMenuItem onClick={() => handleReply(msg)}><Reply className="w-4 h-4 mr-2" /> Reply</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => deleteMessage(msg.id)}><Trash className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </Box>

                            {/* Reaction trigger - responsive position and visibility */}
                            <Box className="absolute bottom-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 pointer-events-auto sm:pointer-events-none sm:group-hover:pointer-events-auto">
                              {renderMessageReactionPicker(msg.id, isSender, isDeleted)}
                            </Box>
                          </>
                        )}
                      </Box>
                      {renderMessageReactionsDisplay(messageReactions[msg.id], msg.id, isSender)}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ))}
          <Box ref={messagesEndRef} />
        </Box>
      )}

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollDown && (
          <motion.div
            key="scroll-button"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25, type: "spring" }}
            className="fixed bottom-40 right-4 z-40 sm:bottom-24"
          >
            <Box className="relative">
              <Button variant="outline" size="icon" className="rounded-full shadow-lg relative z-10" onClick={scrollToBottom}>
                <ChevronDown className="h-5 w-5" />
              </Button>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
    
  );
}