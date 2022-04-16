export class StringUtils {
    public static isETHAddress(address: string): boolean {
        return !!/^0x[a-fA-F0-9]{40}$/.exec(address);
    }
}
