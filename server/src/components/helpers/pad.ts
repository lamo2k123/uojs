export default (num: number, size: number): string => {
    return (Math.pow(10, size) + ~~num).toString().substring(1);
};
