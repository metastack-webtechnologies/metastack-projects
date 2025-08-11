from django.contrib import admin
from .models import Driver, Customer, Vehicle, Order, DriverLocation

# Register your models here to make them accessible in the Django admin panel.

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_id', 'customer', 'driver', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('order_id', 'customer__name', 'driver__user__username')

@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'is_available')
    search_fields = ('user__username', 'phone_number')

admin.site.register(Customer)
admin.site.register(Vehicle)
admin.site.register(DriverLocation)
