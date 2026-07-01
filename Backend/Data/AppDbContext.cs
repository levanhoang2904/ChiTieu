using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Ăn uống", Icon = "🍔", IsIncome = false },
                new Category { Id = 2, Name = "Cafe", Icon = "☕", IsIncome = false },
                new Category { Id = 3, Name = "Sức khỏe", Icon = "💊", IsIncome = false },
                new Category { Id = 4, Name = "Di chuyển", Icon = "🚗", IsIncome = false },
                new Category { Id = 5, Name = "Mua sắm", Icon = "🛒", IsIncome = false },
                new Category { Id = 6, Name = "Khác", Icon = "📦", IsIncome = false },
                new Category { Id = 7, Name = "Điện nước", Icon = "💡", IsIncome = false },
                new Category { Id = 8, Name = "Giáo dục", Icon = "📚", IsIncome = false },
                new Category { Id = 9, Name = "Giải trí", Icon = "🎮", IsIncome = false },
                new Category { Id = 10, Name = "Thuê nhà", Icon = "🏠", IsIncome = false },
                new Category { Id = 11, Name = "Du lịch", Icon = "✈️", IsIncome = false },
                new Category { Id = 12, Name = "Thể thao", Icon = "⚽", IsIncome = false },
                new Category { Id = 13, Name = "Tiền lương", Icon = "💰", IsIncome = true },
                new Category { Id = 14, Name = "Thưởng", Icon = "🎁", IsIncome = true },
                new Category { Id = 15, Name = "Đầu tư", Icon = "📈", IsIncome = true },
                new Category { Id = 16, Name = "Lãi tiết kiệm", Icon = "🏦", IsIncome = true },
                new Category { Id = 17, Name = "Thu nhập khác", Icon = "💵", IsIncome = true }
            );

            modelBuilder.Entity<Transaction>()
                .Property(t => t.IsIncome)
                .HasDefaultValue(false);

        }
    }
}
