class Grid {
    #columns_info; #data;
    constructor({ columns_info = [] }) {
        this.#columns_info = columns_info;
        this.#data = [];
    }

    AddRows(data) { this.#data = data; }

    Draw(container_node) {
        const self = this;
        const table = document.createElement('table');
        table.classList.add('grid');
        table.append(create_grid_header(self, this.#columns_info));
        table.append(create_grid_values(this.#columns_info, this.#data));

        container_node.append(table);
    }
}

const create_grid_header = (self, columns) => {
    // Handle order event
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    columns.map(column => {
        const th = document.createElement('th');
        th.append(document.createTextNode(column.Name));
        th.classList.add('pointer');
        tr.append(th);
    });
    thead.append(tr);
    return thead;
};

const create_grid_values = (columns, rows) => {
    const tbody = document.createElement('tbody');

    rows.map(row => {
        const tr = document.createElement('tr');
        row.forEach((column, j) => {
            const td = document.createElement('td');
            td.style.textAlign = columns[j].Type === 'string' ? 'right' : 'left';
            td.append(document.createTextNode(column));
            tr.append(td);
        });
        tbody.append(tr);
    });

    return tbody;
};

export const create_grid = options => {
    return new Grid(options);
};