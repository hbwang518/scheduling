USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_ReadBeginClassByFactClassSNNew]    Script Date: 2015/1/6 16:53:04 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO





CREATE procedure [dbo].[SP_ReadBeginClassByFactClassSNNew]
@FactClassSN varchar(20)

as 

If Not Exists(Select distinct  dbo.F_INT_TIME(StartTime) as StartTime,dbo.F_INT_TIME(EndTime) as EndTime From BeginClass 
Where  FactClassSN = @FactClassSN And SettlementState >= 'BSSE003' And [State] <> -1 And Del = 0 )
Begin
return Null
End
--物理班基本信息
Select a.FactClassName,b.EMName,dbo.GetNameStrList(@FactClassSN,'Book') as BookName,c.BranchName From FactClass a Join Element b on a.EMSN = b.EMSN Join Branch c on a.BranchSN = c.BranchSN
Where a.FactClassSN = @FactClassSN And a.DEL = 0

--物理班课表
If(object_id('tempdb.dbo.#Temp0') Is Not Null) Drop Table #Temp0;

declare @str nvarchar(max),@str1 nvarchar(max)

set @str1 = ''
Select @str1 = @str1 + '[' + StartTime + '-' + EndTime + '],' From
(
Select distinct  dbo.F_INT_TIME(StartTime) as StartTime,dbo.F_INT_TIME(EndTime) as EndTime From BeginClass 
Where  FactClassSN = @FactClassSN And SettlementState >= 'BSSE003' And [State] <> -1 And Del = 0 
) a Order by StartTime,EndTime 


set @str1=left(@str1,Len(@str1)-1)

set @str = '
Select CONVERT(varchar(10),[Day],120) as oDay,dbo.F_INT_TIME(StartTime) + ''-'' + dbo.F_INT_TIME(EndTime) as oTime,Course 
Into #Temp0 From BeginClass Where FactClassSN = '''+ @FactClassSN +''' And SettlementState >= ''BSSE003'' And [State] <> -1 And Del = 0  '
 
set @str= @str+' Select * FROM #Temp0 PIVOT (Max(Course)  FOR oTime IN ('

set @str= @str + @str1

set @str= @str+ ')) AS thePivot'

exec sp_executesql @str 

If(object_id('tempdb.dbo.#Temp0') Is Not Null) Drop Table #Temp0;





GO


