const shops = [
    {
        id:1,
        image: 'placeholder',
        name: "Insane shop 55",
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
        id:2,
        image: 'placeholder',
        name: "Insane shop 40",
        parameters: {
            reliable: true,
            ready: true,
            preorder: true
        },
        count: 40,
        price: 2000
    },
    {
        id:3,
        image: 'placeholder',
        name: "Insane shop 80",
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
    setCatalog('.index-page__shops', shops, true);
}


function setCatalog(selector, shops, is_adding = false) {
    const parent = document.querySelector(selector);

    if (!is_adding) parent.innerHTML = '';
    shops.forEach(shop => {
        parent.appendChild(generateProduct(shop));
    })

}


function generateProduct(shop) {
    const shopDOM = document.createElement('div');
    shopDOM.className = 'col-xs-6 col-sm-3 maincard';
    const shop_inner = document.createElement('div');
    shop_inner.className = 'maincart mt-2';
    shopDOM.appendChild(shop_inner);
    const shop_cart = document.createElement('div');
    shop_cart.className = 'cart';
    shop_inner.appendChild(shop_cart);

    const inner_div = document.createElement('div');

    shop_cart.appendChild(inner_div);


    const name_row = document.createElement('div');
    name_row.className = 'rw row_sb';
    inner_div.appendChild(name_row);

    const name = document.createElement('a');
    name.innerText = shop.name;
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
    if (shop.parameters.reliable) {
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

    if (shop.parameters.ready) {
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

    if (shop.parameters.reliable) {
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
    final_button.onclick = () => localStorage.setItem("savedProduct", JSON.stringify(shop));

    final_button.href = `/help.html?product_id=${shop.id}`;
    final_button.target = '_blank';
    final_button.className = 'btn btn-warning btn-index pull-right';
    final_button.innerText = 'ОТКРЫТЬ'
//
    image_div_wrapper.appendChild(final_button);

    return shopDOM;
}

function filter(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const cat = formData.get('cat') || '';
    const cit = formData.get('city') || '';
    const query = formData.get('q');
    const from = formData.get('qty[from]') || 0;
    const to = formData.get('qty[to]') || Infinity;

    let filtered_shops = shops.filter(({
                                           name,
                                           count,
                                       }) => name.indexOf(query) >= 0 && count >= from && count <= to);
    // категории
    filtered_shops = filtered_shops.filter(({category = ''}) => clearString(category).toUpperCase().indexOf(clearString(cat).toUpperCase()) >= 0)

    //город
    filtered_shops = filtered_shops.filter(({city = ''}) => clearString(city).toUpperCase().indexOf(clearString(cit).toUpperCase()) >= 0)

    console.log(filtered_shops);

    setCatalog('.index-page__shops', filtered_shops, false);

}


const clearString = s => s.replace(/[^a-zа-яё]/gi, '');
