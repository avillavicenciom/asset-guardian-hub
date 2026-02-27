@echo off
echo ==========================================
echo   Asset Guardian - Instalacion de BD
echo ==========================================
echo.

REM Ruta de XAMPP (cambiar si es diferente)
SET XAMPP_PATH=C:\xampp
SET MYSQL=%XAMPP_PATH%\mysql\bin\mysql.exe

echo [1/3] Verificando MySQL...
IF NOT EXIST "%MYSQL%" (
    echo ERROR: No se encontro MySQL en %XAMPP_PATH%
    echo Asegurate de que XAMPP esta instalado en C:\xampp
    pause
    exit /b 1
)

echo [2/3] Iniciando MySQL si no esta activo...
tasklist /FI "IMAGENAME eq mysqld.exe" | find /I "mysqld.exe" >nul
IF ERRORLEVEL 1 (
    echo Iniciando servicio MySQL...
    start "" "%XAMPP_PATH%\mysql_start.bat"
    timeout /t 5 /nobreak >nul
) ELSE (
    echo MySQL ya esta corriendo.
)

echo [3/3] Ejecutando script SQL...
"%MYSQL%" -u root < "%~dp0schema.sql"

IF ERRORLEVEL 1 (
    echo.
    echo ERROR al ejecutar el script SQL.
    echo Verifica que MySQL este corriendo desde XAMPP.
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   Base de datos creada exitosamente!
echo   Usuario admin: admin / admin123
echo ==========================================
pause
