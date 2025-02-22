class Grid {
    #columns_info; #data;
    constructor({ columns_info = [] }) {
        this.#columns_info = columns_info;
        this.#data = [];
    }

    AddRows(data) { this.#data = data; }

    Draw(container_node) {
        this.container_node = container_node;
        this.container_node.innerHTML = '';
        const self = this;
        const table = document.createElement('table');
        table.classList.add('grid');
        table.append(create_grid_header(self, this.#columns_info));
        table.append(create_grid_values(this.#columns_info, this.#data));

        container_node.append(table);
    }

    ReOrder(index) {
        this.#columns_info.forEach((column, i) => {
            if(i === index) {
                if(column.order === undefined) column.order = 0;
                else column.order = column.order === 0 ? 1 : 0;
            } else {
                delete column.order;
            }
        });

        this.#data.sort((a, b) => {
            if(this.#columns_info[index].order === 0) {
                return a[index] > b[index] ? 1 : -1;
            } else {
                return a[index] < b[index] ? 1 : -1;
            }
        });

        this.Draw(this.container_node);
    }
}

const change_table_order = (event, grid_obj) => {
    const clicked_th = event.target.closest('th');
    const ths = Array.from(event.target.closest('tr').querySelectorAll('th'));
    grid_obj.ReOrder(ths.indexOf(clicked_th));
};

const create_grid_header = (grid_obj, columns) => {
    // Handle order event
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    columns.map(column => {
        const th = document.createElement('th');
        th.append(document.createTextNode(column.Name));
        if(column.order !== undefined) {
            const sort_icon = document.createElement('i');
            sort_icon.classList.add('fa-solid', `fa-${column.order === 0 ? 'sort-up' : 'sort-down'}`);
            th.append(sort_icon);
        }
        th.classList.add('pointer');

        th.addEventListener('click', e => change_table_order(e, grid_obj));

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