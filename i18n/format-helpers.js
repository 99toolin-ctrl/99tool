/**
 * Format Helpers for 99tool.in i18n
 * 
 * Handles locale-specific formatting for:
 * - Numbers (decimal separators, thousands separators)
 * - Dates (different date formats per locale)
 * - Currency (currency symbols, positions)
 */

const formatHelpers = {
  /**
   * Format a number according to locale conventions
   */
  formatNumber(number, decimals = 2, language = 'en') {
    const numberFormats = {
      en: { decimal: '.', thousands: ',' },
      es: { decimal: ',', thousands: '.' },
      fr: { decimal: ',', thousands: ' ' },
      de: { decimal: ',', thousands: '.' },
      it: { decimal: ',', thousands: '.' },
      pt: { decimal: ',', thousands: '.' },
      ru: { decimal: ',', thousands: ' ' },
      ja: { decimal: '.', thousands: ',' },
      zh: { decimal: '.', thousands: ',' },
      ko: { decimal: '.', thousands: ',' },
      ar: { decimal: '٫', thousands: '٬' },
      hi: { decimal: '.', thousands: ',' },
      tr: { decimal: ',', thousands: '.' },
      nl: { decimal: ',', thousands: '.' },
      pl: { decimal: ',', thousands: ' ' },
      sv: { decimal: ',', thousands: ' ' },
      vi: { decimal: ',', thousands: '.' },
      th: { decimal: '.', thousands: ',' },
      id: { decimal: ',', thousands: '.' },
      fa: { decimal: '٫', thousands: '٬' },
      uk: { decimal: ',', thousands: ' ' }
    };
    
    const format = numberFormats[language] || numberFormats['en'];
    const parts = Number(number).toFixed(decimals).split('.');
    
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    // Add thousands separator to integer part
    const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, format.thousands);
    
    // Combine with decimal separator
    return decimalPart ? `${withThousands}${format.decimal}${decimalPart}` : withThousands;
  },
  
  /**
   * Format a date according to locale conventions
   */
  formatDate(date, format = null, language = 'en') {
    const dateFormats = {
      en: 'MM/DD/YYYY',
      es: 'DD/MM/YYYY',
      fr: 'DD/MM/YYYY',
      de: 'DD.MM.YYYY',
      it: 'DD/MM/YYYY',
      pt: 'DD/MM/YYYY',
      ru: 'DD.MM.YYYY',
      ja: 'YYYY年MM月DD日',
      zh: 'YYYY年MM月DD日',
      ko: 'YYYY년 MM월 DD일',
      ar: 'DD/MM/YYYY',
      hi: 'DD/MM/YYYY',
      tr: 'DD.MM.YYYY',
      nl: 'DD-MM-YYYY',
      pl: 'DD.MM.YYYY',
      sv: 'YYYY-MM-DD',
      vi: 'DD/MM/YYYY',
      th: 'DD/MM/YYYY',
      id: 'DD/MM/YYYY',
      fa: 'DD/MM/YYYY',
      uk: 'DD.MM.YYYY'
    };
    
    const dateFormat = format || dateFormats[language] || dateFormats['en'];
    const dateObj = (date instanceof Date) ? date : new Date(date);
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return dateFormat
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year);
  },
  
  /**
   * Format currency according to locale conventions
   */
  formatCurrency(amount, currencyCode = null, language = 'en') {
    const currencyFormats = {
      en: { symbol: '$', position: 'before', decimals: 2 },
      es: { symbol: '€', position: 'after', decimals: 2 },
      fr: { symbol: '€', position: 'after', decimals: 2 },
      de: { symbol: '€', position: 'after', decimals: 2 },
      it: { symbol: '€', position: 'after', decimals: 2 },
      pt: { symbol: 'R$', position: 'before', decimals: 2 },
      ru: { symbol: '₽', position: 'after', decimals: 2 },
      ja: { symbol: '¥', position: 'before', decimals: 0 },
      zh: { symbol: '¥', position: 'before', decimals: 2 },
      ko: { symbol: '₩', position: 'before', decimals: 0 },
      ar: { symbol: '﷼', position: 'after', decimals: 2 },
      hi: { symbol: '₹', position: 'before', decimals: 2 },
      tr: { symbol: '₺', position: 'after', decimals: 2 },
      nl: { symbol: '€', position: 'after', decimals: 2 },
      pl: { symbol: 'zł', position: 'after', decimals: 2 },
      sv: { symbol: 'kr', position: 'after', decimals: 2 },
      vi: { symbol: '₫', position: 'after', decimals: 0 },
      th: { symbol: '฿', position: 'before', decimals: 2 },
      id: { symbol: 'Rp', position: 'before', decimals: 0 },
      fa: { symbol: '﷼', position: 'after', decimals: 2 },
      uk: { symbol: '₴', position: 'after', decimals: 2 }
    };
    
    const currencyFormat = currencyFormats[language] || currencyFormats['en'];
    const formattedAmount = this.formatNumber(amount, currencyFormat.decimals, language);
    
    if (currencyFormat.position === 'before') {
      return `${currencyFormat.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount} ${currencyFormat.symbol}`;
    }
  },
  
  /**
   * Get day name for a date
   */
  getDayName(date, language = 'en') {
    const dayNames = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      fr: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
      de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      it: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'],
      pt: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
      ru: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
      ja: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
      zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      ko: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
      ar: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
      tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
      nl: ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
      pl: ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'],
      sv: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
      vi: ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'],
      th: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
      id: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'],
      fa: ['یکشنبه', 'دوشنبه', 'سهشنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'],
      uk: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота']
    };
    
    const names = dayNames[language] || dayNames['en'];
    const dateObj = (date instanceof Date) ? date : new Date(date);
    return names[dateObj.getDay()];
  },
  
  /**
   * Get month name
   */
  getMonthName(monthIndex, language = 'en') {
    const monthNames = {
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
      pt: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      ru: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      ja: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      zh: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      ko: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
      ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
      hi: ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
      tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
      nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
      pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
      sv: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
      vi: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
      id: ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'],
      fa: ['ژانویه', 'فوریه', 'مارس', 'آوریل', 'مه', 'ژوئن', 'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر'],
      uk: ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень']
    };
    
    const names = monthNames[language] || monthNames['en'];
    return names[monthIndex];
  }
};

// Expose globally for i18n.js
window.formatHelpers = formatHelpers;
