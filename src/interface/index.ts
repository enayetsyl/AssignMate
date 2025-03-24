export interface SubItem {
  label: string
  href: string
}

export interface MenuItem {
  title: string
  href: string
  items: SubItem[]
}
