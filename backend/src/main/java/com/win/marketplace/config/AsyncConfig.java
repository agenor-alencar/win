package com.win.marketplace.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuração para execução assíncrona de tarefas.
 * Usado principalmente para sincronização paralela de múltiplos ERPs.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // Pool configurado para sincronização de ERPs
        executor.setCorePoolSize(5);        // Mínimo de threads
        executor.setMaxPoolSize(20);        // Máximo de threads
        executor.setQueueCapacity(100);     // Fila de espera
        executor.setThreadNamePrefix("erp-sync-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }
}
