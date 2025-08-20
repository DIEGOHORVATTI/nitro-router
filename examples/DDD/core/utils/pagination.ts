export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export const paginate = <T>(items: T[], page: number, limit: number): Paginated<T> => {
  const start = (page - 1) * limit
  const end = page * limit
  const paginatedItems = items.slice(start, end)
  const totalPages = Math.ceil(items.length / limit)

  return {
    items: paginatedItems,
    total: items.length,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrevious: page > 1,
  }
}
