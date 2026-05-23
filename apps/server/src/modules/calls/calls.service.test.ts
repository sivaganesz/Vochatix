import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCall, acceptCall } from './calls.service';
import { callsRepository } from './calls.repository';
import { createMockCall } from '@vochatix/testing';
import * as messagesService from '../messages/messages.service';

vi.mock('./calls.repository', () => ({
  callsRepository: {
    findConversationWithMembers: vi.fn(),
    createCall: vi.fn(),
    findCallById: vi.fn(),
    findCallWithParticipant: vi.fn(),
    updateParticipantStatus: vi.fn(),
    updateCall: vi.fn(),
  }
}));

vi.mock('../messages/messages.service', () => ({
  createSystemMessage: vi.fn(),
}));

describe('calls.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCall', () => {
    it('should create a call and send a system message', async () => {
      const mockCall = createMockCall({ id: 'call_123', roomName: 'room_abc' });
      vi.mocked(callsRepository.findConversationWithMembers).mockResolvedValue({ 
        id: 'conv_1',
        members: [{ userId: 'user_1' }, { userId: 'user_2' }] 
      } as any);
      vi.mocked(callsRepository.createCall).mockResolvedValue(mockCall as any);
      vi.mocked(messagesService.createSystemMessage).mockResolvedValue({ id: 'msg_1' } as any);

      const result = await createCall('conv_1', 'user_1', 'VIDEO', ['user_2']);

      expect(callsRepository.createCall).toHaveBeenCalledWith(
        expect.objectContaining({ conversationId: 'conv_1', callType: 'VIDEO', startedById: 'user_1' }),
        ['user_2']
      );
      expect(messagesService.createSystemMessage).toHaveBeenCalledWith(
        'conv_1', 'Video call started', expect.objectContaining({ callId: 'call_123' }), 'SEEN'
      );
      expect(result.call.id).toBe('call_123');
    });
  });

  describe('acceptCall', () => {
    it('should update participant and call status', async () => {
      const mockCall = createMockCall({ 
        id: 'call_123', 
        status: 'RINGING',
        participants: [{ userId: 'user_1', status: 'RINGING' }]
      });
      vi.mocked(callsRepository.findCallWithParticipant).mockResolvedValue(mockCall as any);
      vi.mocked(callsRepository.updateParticipantStatus).mockResolvedValue({} as any);
      vi.mocked(callsRepository.updateCall).mockResolvedValue(mockCall as any);

      const result = await acceptCall('call_123', 'user_1');

      expect(callsRepository.updateParticipantStatus).toHaveBeenCalledWith('call_123', 'user_1', 'ACCEPTED', 'joinedAt');
      expect(callsRepository.updateCall).toHaveBeenCalledWith('call_123', expect.objectContaining({ status: 'ACCEPTED' }));
      expect(result.id).toBe('call_123');
    });
  });
});
