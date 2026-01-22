echo Creating manage.py...
(
echo #!/usr/bin/env python
echo """Django's command-line utility for administrative tasks."""
echo import os
echo import sys
echo.
echo.
echo def main():
echo     """Run administrative tasks."""
echo     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'eld_log_generator.settings')
echo     try:
echo         from django.core.management import execute_from_command_line
echo     except ImportError as exc:
echo         raise ImportError(
echo             "Couldn't import Django. Are you sure it's installed and "
echo             "available on your PYTHONPATH environment variable? Did you "
echo             "forget to activate a virtual environment?"
echo         ) from exc
echo     execute_from_command_line(sys.argv)
echo.
echo.
echo if __name__ == '__main__':
echo     main()
) > manage.py