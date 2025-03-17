export const Combobox = ({
    id = null,
    options = []
}) => {
    if(id === null) throw new Error('An id must be specified to render the combobox properly');
    const node = document.createElement('select');
    node.id = id;
    node.classList.add('pointer', 'combobox');
    node.style = `width: 100%; height: 100%`;

    options.forEach((option, _) => {
        const option_node = document.createElement('option');
        option_node.value = option.value;
        option_node.append(document.createTextNode(option.text));

        node.append(option_node);
    });

    return node;
};

export const Password = ({ 
    Name, 
    Value = '',
    Placeholder = ''
}) => {
    const input = document.createElement('input');
    input.type = 'password';
    input.id = Name;
    input.name = input.id;
    input.value = Value;
    input.placeholder = Placeholder;

    return input;
};

export const CustomImage = ({
    square = false,
    src = null
}) => {
    const image = document.createElement('img');
    image.classList.add('image');
    if(square) image.style.objectFit = 'cover';

    image.src = src;

    return image;
};