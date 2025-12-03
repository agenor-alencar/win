package com.win.marketplace.dto.response;

/**
 * DTO para estatísticas administrativas de entregas
 */
public record AdminEntregaStatsDTO(
    Long totalEntregas,
    Long aguardandoPreparacao,
    Long aguardandoMotorista,
    Long motoristaACaminhoRetirada,
    Long emTransito,
    Long entregues,
    Long canceladas,
    Long falhasSolicitacao,
    Long problemasAtivos // Falhas + aguardando muito tempo
) {
    
    public static AdminEntregaStatsDTO criar(
        Long totalEntregas,
        Long aguardandoPreparacao,
        Long aguardandoMotorista,
        Long motoristaACaminhoRetirada,
        Long emTransito,
        Long entregues,
        Long canceladas,
        Long falhasSolicitacao
    ) {
        // Problemas = falhas + entregas aguardando muito tempo
        Long problemasAtivos = (falhasSolicitacao != null ? falhasSolicitacao : 0L);
        
        return new AdminEntregaStatsDTO(
            totalEntregas != null ? totalEntregas : 0L,
            aguardandoPreparacao != null ? aguardandoPreparacao : 0L,
            aguardandoMotorista != null ? aguardandoMotorista : 0L,
            motoristaACaminhoRetirada != null ? motoristaACaminhoRetirada : 0L,
            emTransito != null ? emTransito : 0L,
            entregues != null ? entregues : 0L,
            canceladas != null ? canceladas : 0L,
            falhasSolicitacao != null ? falhasSolicitacao : 0L,
            problemasAtivos
        );
    }
}
