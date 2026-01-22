from django.http import JsonResponse

def hello_view(request):
    return JsonResponse({'message': 'ELD Generator API is running!'})