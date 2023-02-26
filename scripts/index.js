const products = [
    {
        image: 'placeholder',
        name: "Insane product 55",
        parameters: {
            reliable: true,
            ready: true,
            preorder: true
        },
        category: 'Марихуана-шишки',
        type: '',
        city: 'Абакан',
        area: '',
        count: 55,
        price: 1000,
    },
    {
        image: 'placeholder',
        name: "Insane product 40",
        parameters: {
            reliable: true,
            ready: true,
            preorder: true
        },
        count: 40,
        price: 2000
    },
    {
        image: 'placeholder',
        name: "Insane product 80",
        parameters: {
            reliable: true,
            ready: true,
            preorder: true
        },
        count: 80,
        price: 3000
    }
]


window.onload = () => {
    console.log('it\'s works');
    setCatalog('.index-page__products', products, true);
}


function setCatalog(selector, products, is_adding = false) {
    const parent = document.querySelector(selector);

    if (!is_adding) parent.innerHTML = '';
    products.forEach(product => {
        parent.appendChild(generateProduct(product));
    })

}


function generateProduct(product) {
    const productDOM = document.createElement('div');
    productDOM.className = 'col-xs-6 col-sm-3 maincard';
    const product_inner = document.createElement('div');
    product_inner.className = 'maincart mt-2';
    productDOM.appendChild(product_inner);
    const product_cart = document.createElement('div');
    product_cart.className = 'cart';
    product_inner.appendChild(product_cart);

    const inner_div = document.createElement('div');

    product_cart.appendChild(inner_div);


    const name_row = document.createElement('div');
    name_row.className = 'rw row_sb';
    inner_div.appendChild(name_row);

    const name = document.createElement('a');
    name.innerText = product.name;
    name.target = '_blank';
    name_row.appendChild(name);
    const name_icon = document.createElement('a')
    name_icon.title = 'Написать продавцу';
    name_icon.target = '_blank';
    //TODO Тут в name_icon должна добавляться fa-иконка

    name_row.appendChild(name_icon);


    const small_after_name = document.createElement('small');
    small_after_name.className = 'pull-left';
    const small_after_name_span = document.createElement('span');
    small_after_name_span.innerText = 'Лучший товар';
    small_after_name.appendChild(small_after_name_span);

    inner_div.appendChild(small_after_name);


    const image_div_wrapper = document.createElement('div');
    inner_div.appendChild(image_div_wrapper);
    const image_wrapper = document.createElement('div');
    image_wrapper.className = 'mt-1';
    image_div_wrapper.appendChild(image_wrapper);
    const image_link = document.createElement('a');
    image_link.target = '_blank';
    image_wrapper.appendChild(image_link);

    const image = document.createElement('img');
    image.className = 'card-img';
    image.src = './images/placeholder.jpeg';
    image_link.appendChild(image);


//
    const parameters = document.createElement('div');
    parameters.className = 'mt-1 shop_deal'
    if (product.parameters.reliable) {
        const reliable = document.createElement('div');
        reliable.className = 'rw row_sb trust';
        reliable.setAttribute('active', true);
        const name = document.createElement('div');
        name.className = 'title_s';
        name.innerText = 'Надежный';

        reliable.appendChild(name);

        const checkbox = document.createElement('div');
        checkbox.className = 'icon_check_wrapper';

        const checkbox_icon = document.createElement('i');
        checkbox_icon.className = 'check';
        checkbox.appendChild(checkbox_icon);


        reliable.appendChild(checkbox);


        parameters.appendChild(reliable);
    }

    if (product.parameters.ready) {
        const reliable = document.createElement('div');
        reliable.className = 'rw row_sb moment';
        reliable.setAttribute('active', true);
        const name = document.createElement('div');
        name.className = 'title_s';
        name.innerText = 'Готовые клады';

        reliable.appendChild(name);

        const checkbox = document.createElement('div');
        checkbox.className = 'icon_check_wrapper';

        const checkbox_icon = document.createElement('i');
        checkbox_icon.className = 'check';
        checkbox.appendChild(checkbox_icon);


        reliable.appendChild(checkbox);


        parameters.appendChild(reliable);
    }

    if (product.parameters.reliable) {
        const reliable = document.createElement('div');
        reliable.className = 'rw row_sb preorder';
        reliable.setAttribute('active', true);
        const name = document.createElement('div');
        name.className = 'title_s';
        name.innerText = 'Товар по предзаказу';

        reliable.appendChild(name);

        const checkbox = document.createElement('div');
        checkbox.className = 'icon_check_wrapper';

        const checkbox_icon = document.createElement('i');
        checkbox_icon.className = 'check';
        checkbox.appendChild(checkbox_icon);


        reliable.appendChild(checkbox);


        parameters.appendChild(reliable);
    }

    image_div_wrapper.appendChild(parameters);


//
    const final_button = document.createElement('a');
    final_button.target = '_blank';
    final_button.className = 'btn btn-warning btn-index pull-right';
    final_button.innerText = 'ОТКРЫТЬ'
//
    image_div_wrapper.appendChild(final_button);

    return productDOM;
}

function filter(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cat = formData.get('cat')||'';
    const cit = formData.get('city')||'';
    const query = formData.get('q');
    const from = formData.get('qty[from]') || 0;
    const to = formData.get('qty[to]') || Infinity;

    let filtered_products = products.filter(({
                                                 name,
                                                 count,
                                             }) => name.indexOf(query) >= 0 && count >= from && count <= to);
    // категории
    filtered_products = filtered_products.filter(({category= ''}) => clearString(category).toUpperCase().indexOf(clearString(cat).toUpperCase()) >= 0)

    //город
    filtered_products = filtered_products.filter(({city= ''}) => clearString(city).toUpperCase().indexOf(clearString(cit).toUpperCase()) >= 0)

    console.log(filtered_products);

    setCatalog('.index-page__products', filtered_products, false);

}


const clearString =  s => s.replace(/[^a-zа-яё]/gi, '');
