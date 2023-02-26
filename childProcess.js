process.on("message", (cant) => {
    const numeros = {}
    for (let i = 1; i <= cant; i++) {
        const number = Math.trunc((Math.random() * 999.999) + 1);    //Número aleatorio entre 1 y 1000
        numeros[number] = numeros[number] ? numeros[number] + 1 : 1;
    }
    process.send(numeros)
})