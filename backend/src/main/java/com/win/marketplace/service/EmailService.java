package com.win.marketplace.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.properties.mail.from:noreply@winmarketplace.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public void enviarEmailResetSenha(String destinatario, String nomeUsuario, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(destinatario);
            helper.setSubject("Win Marketplace - Recuperação de Senha");

            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            
            String htmlContent = """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
                        .warning { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Win Marketplace</h1>
                        </div>
                        <div class="content">
                            <h2>Olá, %s!</h2>
                            <p>Recebemos uma solicitação para redefinir a senha da sua conta.</p>
                            <p>Para criar uma nova senha, clique no botão abaixo:</p>
                            <div style="text-align: center;">
                                <a href="%s" class="button">Redefinir Senha</a>
                            </div>
                            <p>Ou copie e cole o link abaixo no seu navegador:</p>
                            <p style="word-break: break-all; color: #2563eb;">%s</p>
                            <div class="warning">
                                <strong>⚠️ Importante:</strong>
                                <ul>
                                    <li>Este link é válido por apenas 1 hora</li>
                                    <li>Se você não solicitou esta redefinição, ignore este email</li>
                                    <li>Sua senha atual permanecerá inalterada</li>
                                </ul>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Este é um email automático, por favor não responda.</p>
                            <p>&copy; 2025 Win Marketplace. Todos os direitos reservados.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(nomeUsuario, resetUrl, resetUrl);

            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email de reset de senha enviado para: {}", destinatario);
            
        } catch (Exception e) {
            log.error("Erro ao enviar email de reset de senha para {}: {}", destinatario, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email de recuperação de senha", e);
        }
    }

    public void enviarEmailSimples(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(destinatario);
            message.setSubject(assunto);
            message.setText(mensagem);
            
            mailSender.send(message);
            log.info("Email simples enviado para: {}", destinatario);
            
        } catch (Exception e) {
            log.error("Erro ao enviar email para {}: {}", destinatario, e.getMessage(), e);
            throw new RuntimeException("Erro ao enviar email", e);
        }
    }
}
