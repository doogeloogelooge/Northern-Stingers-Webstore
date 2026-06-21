const supabaseClient = supabase.createClient(
  'https://oqhkidahpkhrhayxgeum.supabase.co',
  'sb_publishable_X99T3SQDpC5WT3Df8K8V_Q_2zDICoRx'
)

async function resolveCategory(slugs) {

  let parentId = null
  let currentCategory = null

  for (const slug of slugs) {

    let query = supabaseClient
      .from('categories')
      .select('*')
      .eq('slug', slug)

    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else {
      query = query.is('parent_id', null)
    }

    const { data, error } = await query.maybeSingle()

    if (error || !data) {
      console.error('Category not found:', slug)
      return null
    }

    currentCategory = data
    parentId = data.id
  }

  return currentCategory
}

async function getCategoryPath(category) {

  const path = [category]

  let current = category

  while (current.parent_id) {

    const { data, error } =
      await supabaseClient
        .from('categories')
        .select('*')
        .eq('id', current.parent_id)
        .maybeSingle()

    if (error || !data) {
      break
    }

    path.unshift(data)

    current = data
  }

  return path
}

async function loadProducts(categoryId) {

  const categoryIds =
    await getAllChildCategoryIds(categoryId)

  console.log("ALL CATEGORY IDS:", categoryIds)

  const { data, error } =
    await supabaseClient
      .from('products')
      .select(`
        *,
        product_variants (
          id,
          price,
          image_url
        )
      `)
      .in('category_id', categoryIds)

  console.log("PRODUCTS:", data)
  console.log("PRODUCT ERROR:", error)

  if (error) {
    console.error(error)
    return []
  }

  return data
}

function renderLoadingCards() {

  const grid =
    document.getElementById('products-grid')

  grid.innerHTML = Array(10 ).fill(`
  
    <div class="product-card1 skeleton-card">

      <div class="image-wrapper">

        <div class="skeleton-img"></div>

        <button class="wishlist-btn">
          <img src="/images/heart.png" alt="">
        </button>

      </div>

      <div class="product-info">

        <div class="skeleton-title"></div>

        <div class="skeleton-title short"></div>

        <div class="skeleton-price"></div>

      </div>

    </div>

  `).join('')
}

function renderProducts(products) {

  const grid =
    document.getElementById('products-grid')

  if (!products.length) {

    grid.innerHTML = `
      <p>No products found</p>
    `

    return
  }

  grid.innerHTML = products.map(product => {

    const firstVariant =
      product.product_variants?.[0]

    return `

      <div class="product-card1">

        <div class="image-wrapper">

          <a href="/product.html?slug=${product.slug}">

            <img
              src="${firstVariant?.image_url || ''}"
              alt="${product.title}"
            >

          </a>

          <button class="wishlist-btn">

            <img
              src="/images/heart.png"
              alt=""
            >

          </button>

        </div>

        <div class="product-info">

          <a href="/product.html?slug=${product.slug}">

            <h3 class="product-title">

              <strong>${product.brand}</strong>
              ${product.title}

            </h3>

          </a>

          <p class="product-price red-text">

            from. ${firstVariant?.price || 0} kr

          </p>

        </div>

      </div>

    `
  }).join('')
}

function renderBreadcrumbs(categories) {

  const breadcrumbs =
    document.getElementById('breadcrumbs')

  breadcrumbs.innerHTML =
    categories.map((category, index) => {

      const isActive =
        index === categories.length - 1

      const url =
        '/' +
        categories
          .slice(0, index + 1)
          .map(c => c.slug)
          .join('/')

      return `
        <a
          href="${url}"
          class="${isActive ? 'active' : ''}"
        >
          ${category.name}
        </a>
      `
    }).join(' / ')
}

async function loadCategoryPage() {

  const slugs = window.location.pathname
    .split('/')
    .filter(Boolean)

  const category =
    await resolveCategory(slugs)

  if (!category) {
    console.error('Category not found')
    return
  }

  document.getElementById('category-title')
    .textContent = category.name

  const categoryPath =
  await getCategoryPath(category)
  
  renderBreadcrumbs(categoryPath)

  renderLoadingCards()

  const products =
    await loadProducts(category.id)

  renderProducts(products)

  console.log(category)
  console.log(products)
}

async function getAllChildCategoryIds(categoryId) {

  const ids = [categoryId]

  const { data: children, error } =
    await supabaseClient
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)

  if (error) {
    console.error(error)
    return ids
  }

  for (const child of children) {

    const childIds =
      await getAllChildCategoryIds(child.id)

    ids.push(...childIds)
  }

  return ids
}

loadCategoryPage()