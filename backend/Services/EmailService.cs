using System.Net;
using System.Net.Mail;

namespace backend.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpHost = _configuration["SMTP_HOST"] ?? _configuration["Smtp:Host"];
        var smtpPortStr = _configuration["SMTP_PORT"] ?? _configuration["Smtp:Port"];
        var smtpPort = int.Parse(smtpPortStr ?? "587");
        var smtpUser = _configuration["SMTP_USER"] ?? _configuration["Smtp:User"];
        var smtpPass = _configuration["SMTP_PASS"] ?? _configuration["Smtp:Password"];

        if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUser))
        {
            // Fallback: Log to console for development
            _logger.LogWarning($"[MOCK EMAIL] To: {to} | Subject: {subject} | Body: {body}");
            Console.WriteLine($"[MOCK EMAIL] OTP Sent to {to}: {body}");
            return;
        }

        try
        {
            using (var client = new SmtpClient(smtpHost, smtpPort))
            {
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);
                client.EnableSsl = true;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(smtpUser, "Tourism System"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };

                mailMessage.To.Add(to);
                await client.SendMailAsync(mailMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email. Proceeding anyway (Fallback logged to console).");
            // Log fallback even on failure so developer can see the OTP
            Console.WriteLine($"[EMAIL FAILED] OTP intended for {to}: {body}");
            // DO NOT THROW in development/test if email limits are hit
        }
    }
}
