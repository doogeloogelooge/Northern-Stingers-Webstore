async function loadProductPage() {

    const params = new URLSearchParams(window.location.search)
  
    const slug = params.get('slug')
  
    const { data: product, error: productError } =
      await supabaseClient
        .from('products')
        .select(`
            *,
            categories (
            id,
            name,
            slug,
            parent_id
            )
        `)
        .eq('slug', slug)
        .single()
  
    if (productError) {
      console.error(productError)
      return
    }
  
    const { data: variants, error: variantError } =
      await supabaseClient
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
  
    if (variantError) {
      console.error(variantError)
      return
    }

    const selectedVariant = variants[0]

    await loadAddons(selectedVariant.id)

    const { data, error } = await supabaseClient
        .from('variant_addons')
        .select('*')

        console.log("ADDON DEBUG DATA:", data)
        console.log("ADDON DEBUG ERROR:", error)
  
    // PRODUCT INFO

    document.getElementById('product-brand')
    .textContent = product.brand

    document.getElementById('product-sku')
    .textContent = variants[0].sku
  
    document.getElementById('product-title')
      .textContent = product.brand + " " + product.title
  
    document.getElementById('product-main-img')
      .src = variants[0].image_url

    document.getElementById('product-thumb-img')
        .src = variants[0].image_url
          
    
    const categoryPath = await getCategoryPath(product.categories)

    const fullPath = categoryPath
    .map(cat => cat.slug)
    .join('/')

    document.getElementById('breadcrumbs').innerHTML =
    categoryPath.map((cat, index) => {

        const url = '/' + categoryPath
        .slice(0, index + 1)
        .map(c => c.slug)
        .join('/')

        return `
        <a href="${url}">
            ${cat.name}
        </a>
        `
    }).join(' / ') +
    ` / <span class="current">${product.title}</span>`
    // VARIANTS
  
    const sizeSelect =
      document.getElementById('size-select')
  
    sizeSelect.innerHTML = ''
  
    variants.forEach(variant => {
  
      sizeSelect.innerHTML += `
        <option value="${variant.id}">
          ${variant.variant_name}
        </option>
      `
    })
  
    // DEFAULT PRICE
  
    document.getElementById('price-display')
      .textContent =
        `${variants[0].price} kr`
  
    // STOCK
  
    document.getElementById('stock-count')
      .textContent =
        variants[0].stock
  
    // VARIANT CHANGE
  
    sizeSelect.addEventListener('change', async event => {
        
      const selectedVariantId = event.target.value
  
      const selectedVariant = variants.find(
        variant => variant.id === selectedVariantId
      )
  
      document.getElementById('price-display')
        .textContent =
          `${selectedVariant.price} kr`
  
      document.getElementById('stock-count')
        .textContent =
          selectedVariant.stock
  
      document.getElementById('product-main-img')
        .src =
          selectedVariant.image_url

      document.getElementById('product-thumb-img')
        .src =
          selectedVariant.image_url

      document.getElementById('product-sku')
        .textContent =
          selectedVariant.sku

      await loadAddons(selectedVariant.id)
    })
  
    console.log(product)
    console.log(variants)
  }
  
  async function loadAddons(selectedVariantId) {

    const container = document.getElementById('addons-container')

    console.log("Loading addons for:", selectedVariantId)

    const { data: addonRelations, error: relationError } =
        await supabaseClient
        .from('variant_addons')
        .select('*')
        .eq('variant_id', selectedVariantId)

    console.log("addonRelations:", addonRelations)
    console.log("relationError:", relationError)

    // ALWAYS clear UI first
    container.innerHTML = ''

    if (relationError) {
        container.innerHTML = `<p>Error loading addons</p>`
        return
    }

    if (!addonRelations || addonRelations.length === 0) {
        container.innerHTML = `<p>No addons available for this variant</p>`
        return
    }

    const addonVariantIds = addonRelations.map(r => r.addon_variant_id)

    const { data: addonVariants, error } =
        await supabaseClient
            .from('product_variants')
            .select(`
            id,
            variant_name,
            price,
            image_url,
            products (
                title,
                brand
            )
            `)
            .in('id', addonVariantIds)

    console.log("addonVariants:", addonVariants)
    console.log("variantError:", error)

    if (error) {
        container.innerHTML = `<p>Error loading addon details</p>`
        return
    }

    container.innerHTML = addonVariants.map(addon => `
        <div class="addon-card">
        <img src="${addon.image_url}" class="addon-img">
        <div class="addon-info">
            <span class="addon-name">${addon.products.brand} ${addon.products.title} ${addon.variant_name}</span>
            <span class="addon-price">${addon.price} kr</span>
        </div>
        <input type="checkbox" class="addon-checkbox">
        </div>
    `).join('')
    }

    async function getCategoryPath(category) {
        const path = [category]
      
        let current = category
      
        while (current.parent_id) {
          const { data, error } = await supabaseClient
            .from('categories')
            .select('id, name, slug, parent_id')
            .eq('id', current.parent_id)
            .single()
      
          if (error || !data) break
      
          path.unshift(data)
          current = data
        }
      
        return path
      }

  
  loadProductPage()