from django.urls import path
from . import views

app_name = 'logistics'

urlpatterns = [
    # This now correctly points to the 'login_register_view' function
    path('login/', views.login_register_view, name='login'),
    
    # This points to the dashboard view
    path('dashboard/', views.dashboard_view, name='dashboard'),
    
    # This points to the logout view
    path('logout/', views.logout_view, name='logout'),
]
