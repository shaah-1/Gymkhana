export function mapProduct(row) {
  if (!row) return row;
  const {
    detailed_description,
    how_to_use,
    additional_info,
    ...product
  } = row;
  return {
    ...product,
    detailedDescription: detailed_description,
    howToUse: how_to_use,
    additionalInfo: additional_info,
  };
}

export function toProductRow(product) {
  const {
    detailedDescription,
    howToUse,
    additionalInfo,
    ...fields
  } = product;
  delete fields.created_at;
  return {
    ...fields,
    detailed_description: detailedDescription,
    how_to_use: howToUse,
    additional_info: additionalInfo,
  };
}

export function mapProfile(row) {
  if (!row) return row;
  return {
    ...row,
    fullName: row.name,
    firstName: row.first_name || "",
    lastName: row.last_name || "",
    isAdmin: row.role === "admin",
  };
}

export function mapCartItem(row) {
  if (!row) return row;
  const { user_id, product_id, created_at, ...item } = row;
  return { ...item, userId: user_id, productId: product_id, createdAt: created_at };
}

export function mapWishlistItem(row) {
  return mapCartItem(row);
}

export function mapOrder(row) {
  if (!row) return row;
  const {
    user_id,
    created_at,
    payment_method,
    payment_status,
    payment_details,
    ...order
  } = row;
  return {
    ...order,
    userId: user_id,
    createdAt: created_at,
    paymentMethod: payment_method,
    paymentStatus: payment_status,
    paymentDetails: payment_details,
  };
}

export function toProfileRow(changes) {
  const fields = {
    firstName: "first_name",
    lastName: "last_name",
  };
  return Object.fromEntries(
    Object.entries(changes)
      .filter(([key, value]) => key !== "email" && value !== undefined)
      .map(([key, value]) => [fields[key] || key, value])
  );
}
