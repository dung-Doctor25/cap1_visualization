from django.urls import path
from . import views

urlpatterns = [
    path('upload-csv/', views.upload_csv, name='upload_csv'),
    path('', views.main, name='main'),
    path('visualization/', views.dashboard, name='visualization'),
    path('dash2/', views.dash2, name='dash2'),
    path('dash3/', views.dash3, name='dash3'),
    path('vehicles/', views.vehicle_list, name='vehicle_list'),
    path('delete_vehivle', views.delete_vehicle, name='delete_vehicle'),
]