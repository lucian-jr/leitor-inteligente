

function number_format(number: string, decimals: number, dec_point: string, thousands_sep: string) {
	number = (number + '')
	.replace(/[^0-9+\-Ee.]/g, '');
	var n = !isFinite(+number) ? 0 : +number,
	prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
	sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
	dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
	s: any = '',
	toFixedFix = function(n:number, prec:number) {
		var k = Math.pow(10, prec);
		return '' + (Math.round(n * k) / k)
		.toFixed(prec);
	};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
	.split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '')
	.length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1)
		.join('0');
	}
	return s.join(dec);
}

export function formataValor(valor:string) {
	return number_format(valor, 2, ',', '.');
}

export function inserirValor(valor:string) {
	if(valor) {
		return parseFloat(valor.replace('.', '').replace(',', '.'));
	}
}