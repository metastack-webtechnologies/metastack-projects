from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages

def login_register_view(request):
    """
    Handles both user login and registration forms on one page.
    """
    # If the user is already logged in, redirect them to the dashboard
    if request.user.is_authenticated:
        return redirect('logistics:dashboard')

    if request.method == 'POST':
        # Check if the registration form was submitted
        if 'register_form' in request.POST:
            register_form = UserCreationForm(request.POST)
            if register_form.is_valid():
                user = register_form.save()
                login(request, user)
                # This message will be displayed as a pop-up on the dashboard
                messages.success(request, 'Account created successfully! Welcome.')
                return redirect('logistics:dashboard')
            else:
                # If registration fails, show the form with errors
                login_form = AuthenticationForm()
        
        # Check if the login form was submitted
        elif 'login_form' in request.POST:
            login_form = AuthenticationForm(request, data=request.POST)
            if login_form.is_valid():
                username = login_form.cleaned_data.get('username')
                password = login_form.cleaned_data.get('password')
                user = authenticate(username=username, password=password)
                if user is not None:
                    login(request, user)
                    return redirect('logistics:dashboard')
            else:
                # If login fails, show the form with errors
                register_form = UserCreationForm()
        
    # For a GET request, create empty forms to display
    login_form = AuthenticationForm()
    register_form = UserCreationForm()
    return render(request, 'logistics/login.html', {
        'login_form': login_form, 
        'register_form': register_form
    })

@login_required(login_url='/logistics/login/')
def dashboard_view(request):
    """
    Renders the main manager dashboard page.
    The @login_required decorator protects this page.
    """
    return render(request, 'logistics/dashboard_base.html')

def home_redirect_view(request):
    """
    Redirects the root URL ('/') to the login page.
    """
    return redirect('logistics:login')

def logout_view(request):
    """
    Logs the user out and redirects to the login page.
    """
    logout(request)
    return redirect('logistics:login')
