describe('Basic Test Setup', () => {
  it('should pass basic arithmetic', () => {
    expect(1 + 1).toBe(2)
    expect(2 * 3).toBe(6)
  })

  it('should work with strings', () => {
    expect('hello').toBe('hello')
    expect('hello world').toContain('world')
  })

  it('should work with arrays', () => {
    const arr = [1, 2, 3]
    expect(arr).toHaveLength(3)
    expect(arr).toContain(2)
    expect(arr[0]).toBe(1)
  })

  it('should work with objects', () => {
    const obj = { name: 'test', value: 42 }
    expect(obj).toHaveProperty('name')
    expect(obj.name).toBe('test')
    expect(obj.value).toBe(42)
  })

  it('should work with booleans', () => {
    expect(true).toBe(true)
    expect(false).toBe(false)
    expect(!true).toBe(false)
  })
})
