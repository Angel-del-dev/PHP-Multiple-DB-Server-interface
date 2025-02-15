export const useState = default_value => {
    let value = default_value;

    return [
        () => value,
        new_value => { value = new_value; }
    ];
};