import { parseISO, format, isValid } from 'date-fns';

export const formatarData = (dataISO: string) => {
    // Usamos toLocaleTimeString pois agora é um campo de hora
    return new Date(`1970-01-01T${dataISO}`).toLocaleTimeString('pt-BR', {
        hour: '2-digit', minute: '2-digit'
    });
};

/**
 * Converte um número total de segundos para uma string no formato HH:MM.
 * @param segundosTotais - O número de segundos a ser convertido.
 * @returns Uma string formatada como "HH:MM".
 */
export const formatarSegundosParaHHMM = (segundosTotais: number): string => {
    // Validação: Retorna '00:00' para entradas inválidas, nulas ou negativas.
    if (segundosTotais == null || isNaN(segundosTotais) || segundosTotais < 0) {
      return "00:00";
    }
  
    // 1. Calcula o número total de horas (inteiro).
    const horas = Math.floor(segundosTotais / 3600);
  
    // 2. Calcula os minutos restantes após subtrair as horas.
    const segundosRestantes = segundosTotais % 3600;
    const minutos = Math.floor(segundosRestantes / 60);
  
    // 3. Formata ambos os valores para terem sempre dois dígitos (ex: 7 -> "07").
    const horasFormatadas = String(horas).padStart(2, '0');
    const minutosFormatados = String(minutos).padStart(2, '0');
  
    // 4. Retorna a string interpolada.
    return `${horasFormatadas}:${minutosFormatados}`;
  };


  /**
   * Formata uma string de data/hora ISO para HH:MM.
   * @param datetimeString A string de data/hora (ex: "2025-10-18T14:06:07-03:00").
   * @returns A hora formatada como "HH:MM" ou "--:--" se a entrada for inválida.
   */
  export const formatarDatetimeParaHHMM = (datetimeString: string | null | undefined): string => {
    if (!datetimeString) {
      return "--:--";
    }
  
    try {
      // 1. Converte a string ISO para um objeto Date do JavaScript
      const dateObject = parseISO(datetimeString);
      
      // 2. Verifica se a data resultante é válida
      if (!isValid(dateObject)) {
          return "--:--";
      }
  
      // 3. Formata o objeto Date para a string "HH:mm"
      //    HH = Hora em formato 24h com dois dígitos (00-23)
      //    mm = Minuto com dois dígitos (00-59)
      return format(dateObject, 'HH:mm');
  
    } catch (error) {
      console.error("Erro ao formatar data:", datetimeString, error);
      return "--:--";
    }
  };