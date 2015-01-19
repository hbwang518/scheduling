USE [HQ_XUEYUAN]
GO

/****** Object:  StoredProcedure [dbo].[SP_ReadBeginClassByFactClassSN]    Script Date: 2015/1/6 16:52:55 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO




CREATE procedure [dbo].[SP_ReadBeginClassByFactClassSN]
@FactClassSN varchar(20)

as 

--物理班基本信息
Select a.FactClassName,b.EMName,dbo.GetNameStrList(@FactClassSN,'Book') as BookName,c.BranchName From FactClass a Join Element b on a.EMSN = b.EMSN Join Branch c on a.BranchSN = c.BranchSN
Where a.FactClassSN = @FactClassSN And a.DEL = 0

--物理班课表
Select Convert(varchar(10),[Day],120) as [Day],dbo.F_INT_TIME(StartTime) + '-' +dbo.F_INT_TIME(EndTime) as [Time],ClassRoomName,TeacherName,Course From V_Class_RollBook_Teacher 
Where FactClassSN = @FactClassSN Order By [Day]




GO


