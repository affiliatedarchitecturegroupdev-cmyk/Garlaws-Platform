'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  channelId: string;
  threadId?: string;
  reactions: { [emoji: string]: string[] };
  edited?: boolean;
  editedAt?: Date;
}

interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  members: string[];
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  unreadCount: number;
}

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  currentChannel?: string;
  customStatus?: string;
}

interface CallSession {
  id: string;
  channelId: string;
  initiator: string;
  participants: string[];
  type: 'voice' | 'video';
  status: 'ringing' | 'connected' | 'ended';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

interface UnifiedCommunicationProps {
  tenantId?: string;
  currentUserId?: string;
  onMessageSent?: (message: Message) => void;
  onCallStarted?: (call: CallSession) => void;
  onChannelCreated?: (channel: Channel) => void;
}

const SAMPLE_CHANNELS: Channel[] = [
  {
    id: 'general',
    name: 'general',
    type: 'public',
    description: 'General discussion channel',
    members: ['user1', 'user2', 'user3', 'user4', 'user5'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date(),
    unreadCount: 0
  },
  {
    id: 'engineering',
    name: 'engineering',
    type: 'public',
    description: 'Technical discussions and development updates',
    members: ['user1', 'user2', 'user3'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date(),
    unreadCount: 2
  },
  {
    id: 'design',
    name: 'design',
    type: 'public',
    description: 'UI/UX design discussions and feedback',
    members: ['user1', 'user4', 'user5'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date(),
    unreadCount: 1
  },
  {
    id: 'random',
    name: 'random',
    type: 'public',
    description: 'Casual conversations and fun discussions',
    members: ['user1', 'user2', 'user3', 'user4', 'user5'],
    createdBy: 'admin',
    createdAt: new Date('2024-01-01'),
    lastActivity: new Date(),
    unreadCount: 0
  }
];

const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'msg1',
    senderId: 'user1',
    senderName: 'Alice Johnson',
    content: 'Good morning team! How is everyone doing today?',
    timestamp: new Date(Date.now() - 3600000),
    type: 'text',
    channelId: 'general',
    reactions: { '👍': ['user2', 'user3'], '☕': ['user4'] }
  },
  {
    id: 'msg2',
    senderId: 'user2',
    senderName: 'Bob Smith',
    content: 'Morning Alice! Just finished the quarterly report. Ready for review.',
    timestamp: new Date(Date.now() - 3300000),
    type: 'text',
    channelId: 'general',
    reactions: { '👏': ['user1', 'user3'] }
  },
  {
    id: 'msg3',
    senderId: 'user3',
    senderName: 'Carol Davis',
    content: 'Great work Bob! I\'ll take a look at it after my morning standup.',
    timestamp: new Date(Date.now() - 3000000),
    type: 'text',
    channelId: 'general',
    reactions: {}
  },
  {
    id: 'msg4',
    senderId: 'system',
    senderName: 'System',
    content: 'user4 joined the channel',
    timestamp: new Date(Date.now() - 2700000),
    type: 'system',
    channelId: 'general',
    reactions: {}
  },
  {
    id: 'msg5',
    senderId: 'user4',
    senderName: 'David Wilson',
    content: 'Thanks for the invite! Looking forward to collaborating with everyone.',
    timestamp: new Date(Date.now() - 2400000),
    type: 'text',
    channelId: 'general',
    reactions: { '👋': ['user1', 'user2', 'user3'] }
  }
];

const SAMPLE_USERS = [
  { id: 'user1', name: 'Alice Johnson', avatar: 'AJ', role: 'Engineering Lead' },
  { id: 'user2', name: 'Bob Smith', avatar: 'BS', role: 'Product Manager' },
  { id: 'user3', name: 'Carol Davis', avatar: 'CD', role: 'Senior Developer' },
  { id: 'user4', name: 'David Wilson', avatar: 'DW', role: 'UX Designer' },
  { id: 'user5', name: 'Eve Chen', avatar: 'EC', role: 'DevOps Engineer' }
];

export default function UnifiedCommunication({
  tenantId = 'default',
  currentUserId = 'user1',
  onMessageSent,
  onCallStarted,
  onChannelCreated
}: UnifiedCommunicationProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'video'>('chat');
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [channels, setChannels] = useState<Channel[]>(SAMPLE_CHANNELS);
  const [messages, setMessages] = useState<Record<string, Message[]>>({ general: SAMPLE_MESSAGES });
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([
    { userId: 'user1', status: 'online', lastSeen: new Date(), currentChannel: 'general' },
    { userId: 'user2', status: 'online', lastSeen: new Date(), currentChannel: 'engineering' },
    { userId: 'user3', status: 'away', lastSeen: new Date(Date.now() - 300000) },
    { userId: 'user4', status: 'online', lastSeen: new Date(), currentChannel: 'design' },
    { userId: 'user5', status: 'busy', lastSeen: new Date() }
  ]);
  const [currentCall, setCurrentCall] = useState<CallSession | null>(null);
  const [isCallMinimized, setIsCallMinimized] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedChannel]);

  const sendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: currentUserId,
      senderName: SAMPLE_USERS.find(u => u.id === currentUserId)?.name || 'Unknown',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      channelId: selectedChannel,
      reactions: {}
    };

    setMessages(prev => ({
      ...prev,
      [selectedChannel]: [...(prev[selectedChannel] || []), message]
    }));

    // Update channel last activity
    setChannels(prev => prev.map(channel =>
      channel.id === selectedChannel
        ? { ...channel, lastActivity: new Date(), unreadCount: 0 }
        : channel
    ));

    setNewMessage('');
    onMessageSent?.(message);
  }, [newMessage, selectedChannel, currentUserId, onMessageSent]);

  const startCall = useCallback((type: 'voice' | 'video') => {
    const call: CallSession = {
      id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      channelId: selectedChannel,
      initiator: currentUserId,
      participants: channels.find(c => c.id === selectedChannel)?.members || [],
      type,
      status: 'ringing',
      startTime: new Date()
    };

    setCurrentCall(call);
    onCallStarted?.(call);
  }, [selectedChannel, currentUserId, channels, onCallStarted]);

  const endCall = useCallback(() => {
    if (currentCall) {
      const endedCall: CallSession = {
        ...currentCall,
        status: 'ended',
        endTime: new Date(),
        duration: currentCall.startTime ? Date.now() - currentCall.startTime.getTime() : 0
      };
      setCurrentCall(null);
    }
  }, [currentCall]);

  const addReaction = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => ({
      ...prev,
      [selectedChannel]: prev[selectedChannel]?.map(msg =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: {
                ...msg.reactions,
                [emoji]: msg.reactions[emoji]
                  ? (msg.reactions[emoji].includes(currentUserId)
                      ? msg.reactions[emoji].filter(id => id !== currentUserId)
                      : [...msg.reactions[emoji], currentUserId])
                  : [currentUserId]
              }
            }
          : msg
      ) || []
    }));
  }, [selectedChannel, currentUserId]);

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const getUserStatusColor = (status: UserPresence['status']) => {
    switch (status) {
      case 'online': return '#10B981';
      case 'away': return '#F59E0B';
      case 'busy': return '#EF4444';
      case 'offline': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const channelMessages = messages[selectedChannel] || [];
  const totalUnread = channels.reduce((sum, channel) => sum + channel.unreadCount, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Unified Communication Platform</h1>
            <p className="text-gray-600">Integrated chat, voice, video, and screen sharing</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Active Channel</div>
              <div className="font-medium">#{currentChannel?.name}</div>
            </div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{channels.length}</div>
            <div className="text-sm text-gray-600">Channels</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {onlineUsers.filter(u => u.status === 'online').length}
            </div>
            <div className="text-sm text-gray-600">Online Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalUnread}</div>
            <div className="text-sm text-gray-600">Unread Messages</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {currentCall ? '1' : '0'}
            </div>
            <div className="text-sm text-gray-600">Active Calls</div>
          </div>
        </div>
      </div>

      {/* Communication Interface */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { id: 'chat', label: 'Chat', icon: '💬' },
              { id: 'voice', label: 'Voice Call', icon: '📞' },
              { id: 'video', label: 'Video Call', icon: '📹' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="grid grid-cols-12 h-[600px]">
          {/* Sidebar - Channels */}
          <div className="col-span-3 border-r border-gray-200 p-4">
            <div className="mb-4">
              <h3 className="font-medium mb-2">Channels</h3>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between ${
                      selectedChannel === channel.id
                        ? 'bg-blue-100 text-blue-900'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>#</span>
                      <span className="truncate">{channel.name}</span>
                    </span>
                    {channel.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {channel.unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Online Users */}
            <div>
              <h3 className="font-medium mb-2">Online Users ({onlineUsers.filter(u => u.status === 'online').length})</h3>
              <div className="space-y-2">
                {SAMPLE_USERS.map((user) => {
                  const presence = onlineUsers.find(p => p.userId === user.id);
                  return (
                    <div key={user.id} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium">
                          {user.avatar}
                        </div>
                        <div
                          className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                          style={{ backgroundColor: getUserStatusColor(presence?.status || 'offline') }}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.role}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9 flex flex-col">
            {/* Channel Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">#{currentChannel?.name}</h2>
                <p className="text-sm text-gray-600">{currentChannel?.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => startCall('voice')}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <span>📞</span>
                  Voice Call
                </button>
                <button
                  onClick={() => startCall('video')}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <span>📹</span>
                  Video Call
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {channelMessages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium flex-shrink-0">
                    {SAMPLE_USERS.find(u => u.id === message.senderId)?.avatar || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {message.senderName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      {message.edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-900 mb-2">
                      {message.type === 'system' ? (
                        <span className="text-gray-500 italic">{message.content}</span>
                      ) : (
                        message.content
                      )}
                    </div>

                    {/* Reactions */}
                    {Object.keys(message.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {Object.entries(message.reactions).map(([emoji, users]) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(message.id, emoji)}
                            className={`px-2 py-1 rounded-full text-xs border ${
                              users.includes(currentUserId)
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {emoji} {users.length}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick Reactions */}
                    <div className="flex gap-1">
                      {['👍', '❤️', '😂', '😮', '😢'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => addReaction(message.id, emoji)}
                          className="text-gray-400 hover:text-gray-600 text-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message #${currentChannel?.name}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Call Modal */}
      {currentCall && !isCallMinimized && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {currentCall.type === 'video' ? 'Video Call' : 'Voice Call'} in #{currentChannel?.name}
                </h2>
                <button
                  onClick={() => setIsCallMinimized(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ➖
                </button>
              </div>

              {/* Call Participants */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {currentCall.participants.slice(0, 6).map((participantId) => {
                  const user = SAMPLE_USERS.find(u => u.id === participantId);
                  return (
                    <div key={participantId} className="text-center">
                      <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-2 flex items-center justify-center text-lg font-medium">
                        {user?.avatar}
                      </div>
                      <div className="text-sm font-medium">{user?.name}</div>
                      <div className="text-xs text-gray-500">{user?.role}</div>
                    </div>
                  );
                })}
              </div>

              {/* Call Controls */}
              <div className="flex items-center justify-center gap-4">
                <button className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                  <span className="text-lg">🎤</span>
                </button>
                <button className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center">
                  <span className="text-lg">📹</span>
                </button>
                <button
                  onClick={() => setIsScreenSharing(!isScreenSharing)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    isScreenSharing ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <span className="text-lg">🖥️</span>
                </button>
                <button
                  onClick={endCall}
                  className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center"
                >
                  <span className="text-lg text-white">📞</span>
                </button>
              </div>

              {isScreenSharing && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <span>🖥️</span>
                    <span className="text-sm">You are sharing your screen</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Minimized Call Bar */}
      {currentCall && isCallMinimized && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {currentCall.type === 'video' ? '📹' : '📞'}
            </span>
            <span className="text-sm font-medium">
              Call in #{currentChannel?.name} ({currentCall.participants.length} participants)
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsCallMinimized(false)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
            >
              Open
            </button>
            <button
              onClick={endCall}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              End
            </button>
          </div>
        </div>
      )}
    </div>
  );
}