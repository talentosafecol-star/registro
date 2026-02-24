# Registro
El sistema contiene registro,login y perfil del usuario

Objetivo: Diseñar y generar el código base para un sistema de autenticación completo (Registro, Login con OTP, y Perfil de Usuario) para una aplicación web de reporte de incidentes.

Contexto del Proyecto:

Aplicación: Web App para el reporte de incidentes de seguridad y convivencia.
Tecnología: React (preferiblemente con Next.js para optimización en Vercel).
Despliegue: Vercel.
Tono: La interfaz debe ser profesional, clara y transmitir confianza y seriedad.


Tareas a Desarrollar:

Registro de Usuario: Formulario que solicita email y contraseña. Al enviar, se genera y envía un código OTP al correo del usuario para verificar la cuenta.

Inicio de Sesión (Login): Formulario que solicita email y contraseña. Tras la autenticación exitosa, se requiere un segundo factor OTP enviado al email para completar el login.

Perfil de Usuario: Una página protegida donde el usuario puede ver su información (email, fecha de registro) y cerrar sesión.

Requisitos Técnicos y de Diseño (Mejores Prácticas):

Principios SOLID:
SRP: Cada componente (RegisterForm, LoginOTP, UserProfile) debe tener una única responsabilidad.
OCP/DIP: Diseña un servicio de autenticación (authService.js) que pueda ser fácilmente extendido. La lógica de UI debe depender de abstracciones de este servicio, no de implementaciones concretas.
