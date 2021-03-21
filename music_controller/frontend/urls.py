from django.urls import path
from .views import index


app_name = 'frontend'

urlpatterns = [
    path('', index, name=''), # name='' is needed to get redirected to this app (/spotify/views)
    path('join', index),
    path('create', index),
    path('room/<str:roomCode>', index)
]