from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer, MessageSerializer, MessagesSerializer
from .models import Room, Message
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse


# Create your views here.

class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class GetRoom(APIView):
    serializer_class = RoomSerializer
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)
        # request.GET is giving info about the URL from the get request
        # .get is looking for a parameter that matches with the one that is inside of the parentheses.
        self.request.session['message_count'] = 0

        if code != None:
            room = Room.objects.filter(code=code)
            if room.exists():
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host 
                # checking to see if the user that requested this page, is the host of the room
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room Not Found': 'Invalid Room Code.'}, status=status.HTTP_404_NOT_FOUND)

        return Response({'Bad Request': 'Code parameter not found in request'}, status=status.HTTP_400_BAD_REQUEST)


class SendMessage(APIView):
    serializer_class = MessageSerializer
    
    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({'Bad_Request': 'Room not found!'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            content = serializer.data.get("content")
            message = Message(author=self.request.session.session_key, content=content, room=room)
            message.save()

        self.request.session['message_count'] += 1

        return Response({'message': 'Message object created.'}, status=status.HTTP_201_CREATED)


class GetRoomMessages(APIView):
    def get(self, request, format=None):
        session_id = self.request.session.session_key

        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)

        if room.exists():
            room = room[0]
        else:
            return Response({"message": "User not in a room."}, status=status.HTTP_404_NOT_FOUND)

        messages = Message.objects.filter(room=room.id)

        msg_count = self.request.session['message_count']

        if msg_count == len(messages): # checking to see if there are new messages. If not, return
            return Response({"message": "No new messages."}, status=status.HTTP_204_NO_CONTENT)

        message_list = []
        for message in messages[msg_count:]: # only getting the new messages
            data = MessagesSerializer(message).data
            author = data['author']
            data['author'] = True if author == session_id else False
            message_list.append(data)

        self.request.session['message_count'] += len(message_list)

        return Response(message_list, status=status.HTTP_200_OK)


class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        self.request.session['message_count'] = 0

        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room_result = Room.objects.filter(code=code)

            if room_result.exists():
                room = room_result[0]
                self.request.session['room_code'] = code # storing room_code at user's session
                return Response({'message': 'Room Joined.'}, status=status.HTTP_200_OK)
            
            return Response({'Bad Request': 'Invalid room code.'}, status=status.HTTP_400_BAD_REQUEST)                

        return Response({'Bad Request': 'Invalid post data, did not find a code key.'}, status=status.HTTP_400_BAD_REQUEST)


class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                
                self.request.session['room_code'] = room.code # storing the code of the room that the user in. (at user's session)
                self.request.session['message_count'] = 0

                return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)
            
            else:
                room = Room(host=host, guest_can_pause=guest_can_pause, votes_to_skip=votes_to_skip)
                room.save()
                self.request.session['room_code'] = room.code # storing user info

                return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

        return Response({'Bad Request': 'Invalid data...'}, status=status.HTTP_400_BAD_REQUEST)


class UserInRoom(APIView):
    def get(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        data = {
            'code': self.request.session.get('room_code')
        }
        return JsonResponse(data, status=status.HTTP_200_OK)


class LeaveRoom(APIView):
    def post(self, request, format=None):
        # the user does not have to be in a room to actually leave the room (Program is just gonna delete the user's session anyway)
        if 'room_code' in self.request.session:
            self.request.session.pop('room_code')
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if room_results.exists():
                room = room_results[0]
                room.delete()
        
        return Response({'Message': 'Success'}, status=status.HTTP_200_OK)


class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None): # use patch when updating some stuff. (not creating or deleting)
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            guest_can_pause = serializer.data.get("guest_can_pause")
            votes_to_skip = serializer.data.get("votes_to_skip")
            code = serializer.data.get("code")

            query_set = Room.objects.filter(code=code)
            if not query_set.exists():
                return Response({"msg": "Room not found."}, status=status.HTTP_404_NOT_FOUND)

            room = query_set[0]
            user_id = self.request.session.session_key
            if room.host != user_id:
                return Response({"msg": "You are not the host of this room."}, status=status.HTTP_403_FORBIDDEN)

            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields = ["guest_can_pause", "votes_to_skip"])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({"Bad Request": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)
