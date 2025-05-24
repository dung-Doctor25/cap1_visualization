from django.urls import path
from . import views

urlpatterns = [
    path('upload-csv/', views.upload_csv, name='upload_csv'),
    path('', views.main, name='main'),
    path('visualization/', views.dashboard, name='visualization'),
    path('dash2/', views.dash2, name='dash2'),
    path('dash3/', views.dash3, name='dash3'),
]