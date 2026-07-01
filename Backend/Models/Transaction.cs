using System;

namespace Backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime Date { get; set; } = DateTime.Now;

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public bool IsIncome { get; set; } = false;
    }
}
