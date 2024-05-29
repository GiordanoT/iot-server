class U {
    static getRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        let index = 0;
        while(index < length) {
            const randomNumber = Math.floor(Math.random() * characters.length);
            randomString += characters.charAt(randomNumber);
            index += 1;
        }
        return randomString;
    }
    static sleep(s: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, s * 1000));
    }

}

export default U;
