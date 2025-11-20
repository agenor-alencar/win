package com.win.marketplace.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Scanner;

/**
 * Utilitário para gerar hash BCrypt de senhas.
 * Útil para criar contas de admin diretamente no banco de dados.
 * 
 * Como usar:
 * 1. Execute esta classe como aplicação Java standalone
 * 2. Digite a senha quando solicitado
 * 3. Copie o hash gerado
 * 4. Use o hash no INSERT do banco de dados
 * 
 * Exemplo de SQL:
 * INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)
 * VALUES (
 *   gen_random_uuid(),
 *   'admin@winmarketplace.com',
 *   '$2a$10$...[hash gerado]...',
 *   'Administrador',
 *   'ADMIN',
 *   true,
 *   NOW(),
 *   NOW()
 * );
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=================================================");
        System.out.println("    GERADOR DE HASH DE SENHA - WIN MARKETPLACE");
        System.out.println("=================================================");
        System.out.println();
        
        while (true) {
            System.out.print("Digite a senha (ou 'sair' para encerrar): ");
            String senha = scanner.nextLine();
            
            if (senha.equalsIgnoreCase("sair")) {
                System.out.println("\nEncerrando...");
                break;
            }
            
            if (senha.trim().isEmpty()) {
                System.out.println("❌ Senha não pode ser vazia!\n");
                continue;
            }
            
            String hash = encoder.encode(senha);
            
            System.out.println("\n✅ Hash gerado com sucesso!");
            System.out.println("─────────────────────────────────────────────────");
            System.out.println(hash);
            System.out.println("─────────────────────────────────────────────────");
            
            // Exemplo de SQL
            System.out.println("\n📋 Exemplo de SQL para inserir admin:");
            System.out.println("─────────────────────────────────────────────────");
            System.out.println("INSERT INTO usuarios (id, email, senha, nome, role, ativo, criado_em, atualizado_em)");
            System.out.println("VALUES (");
            System.out.println("  gen_random_uuid(),");
            System.out.println("  'admin@winmarketplace.com',");
            System.out.println("  '" + hash + "',");
            System.out.println("  'Administrador',");
            System.out.println("  'ADMIN',");
            System.out.println("  true,");
            System.out.println("  NOW(),");
            System.out.println("  NOW()");
            System.out.println(");");
            System.out.println("─────────────────────────────────────────────────");
            System.out.println();
        }
        
        scanner.close();
    }
    
    /**
     * Método auxiliar para gerar hash de forma programática
     */
    public static String generateHash(String senha) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(senha);
    }
    
    /**
     * Método auxiliar para verificar se uma senha corresponde a um hash
     */
    public static boolean verifyPassword(String senha, String hash) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.matches(senha, hash);
    }
}
